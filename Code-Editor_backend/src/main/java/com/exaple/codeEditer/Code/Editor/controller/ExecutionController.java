package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.dto.ExecutionHistory.ExecutionHistoryDTO;
import com.exaple.codeEditer.Code.Editor.dto.ExecutionHistory.RecordExecutionRequest;
import com.exaple.codeEditer.Code.Editor.dto.piston.ExecuteRequest;
import com.exaple.codeEditer.Code.Editor.dto.piston.ExecuteResponse;
import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.ExecutionHistoryRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import com.exaple.codeEditer.Code.Editor.service.ExecutionRouterService;
import com.exaple.codeEditer.Code.Editor.service.RateLimitService;

import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionRouterService executionRouterService;
    private final ExecutionHistoryRepository executionHistoryRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(ExecutionController.class);
    private final RateLimitService rateLimitService;

    @PostMapping("/rooms/{roomId}/execute")
    @PreAuthorize("hasPermission(#roomId.toString(), 'TERMINAL_ACCESS')")
    public ResponseEntity<ExecuteResponse> execute(
            @PathVariable UUID roomId,
            @Valid @RequestBody ExecuteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!rateLimitService.allowExecution(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }

        // Execute via Native Docker container (asynchronous streaming over WS)
        String execId = executionRouterService.executeNative(roomId, request, userDetails.getUsername());

        return ResponseEntity.accepted().body(ExecuteResponse.builder()
                .status("Execution started. Stream will be sent via WebSocket.")
                .execId(execId)
                .build());
    }

    @PostMapping({"/rooms/{roomId}/executions", "/rooms/{roomId}/executions/record"})
    @PreAuthorize("hasPermission(#roomId.toString(), 'TERMINAL_ACCESS')")
    public ResponseEntity<ExecutionHistoryDTO> recordExecution(
            @PathVariable UUID roomId,
            @RequestBody RecordExecutionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ExecutionHistory.ExecutionStatus execStatus = resolveStatus(request.getStatus(), request.getExitCode());

        ExecutionHistory history = ExecutionHistory.builder()
                .room(room)
                .runBy(user)
                .language(request.getLanguage() != null ? request.getLanguage().toLowerCase() : "plaintext")
                .sourceCode(request.getSourceCode() != null ? request.getSourceCode() : "")
                .stdout(request.getStdout())
                .stderr(request.getStderr())
                .exitCode(request.getExitCode())
                .durationMs(request.getDurationMs() != null ? request.getDurationMs() : 0)
                .status(execStatus)
                .executedAt(LocalDateTime.now())
                .build();

        history = executionHistoryRepository.save(history);

        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(history));
    }

    @Transactional
    @GetMapping("/rooms/{roomId}/executions")
    @PreAuthorize("hasPermission(#roomId.toString(), 'PREVIEW_ACCESS')")
    public ResponseEntity<Page<ExecutionHistoryDTO>> getHistory(
            @PathVariable UUID roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        Pageable pageable = PageRequest.of(page, Math.min(size, 50)); // cap at 50

        Page<ExecutionHistory> histories =
                 executionHistoryRepository.findByRoomWithAssociations(room, pageable);

        return ResponseEntity.ok(histories.map(this::toDTO));
    }

    @Transactional
    @GetMapping("/executions")
    public ResponseEntity<Page<ExecutionHistoryDTO>> getUserExecutions(
            @RequestParam(required = false) UUID roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));

        Page<ExecutionHistory> histories;
        if (roomId != null) {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found"));
            histories = executionHistoryRepository.findByUserAndRoomWithAssociations(user, room, pageable);
        } else {
            histories = executionHistoryRepository.findByUserWithAssociations(user, pageable);
        }

        return ResponseEntity.ok(histories.map(this::toDTO));
    }

    private ExecutionHistory.ExecutionStatus resolveStatus(String statusStr, Integer exitCode) {
        if ("Service unavailable".equalsIgnoreCase(statusStr)
                || "SERVICE_UNAVAILABLE".equalsIgnoreCase(statusStr)
                || (exitCode != null && exitCode >= 500)) {
            return ExecutionHistory.ExecutionStatus.SERVICE_UNAVAILABLE;
        }
        if ("Time Limit Exceeded".equalsIgnoreCase(statusStr)
                || "TIMEOUT".equalsIgnoreCase(statusStr)
                || (exitCode != null && exitCode == 124)) {
            return ExecutionHistory.ExecutionStatus.TIMEOUT;
        }
        if ("Compilation Error".equalsIgnoreCase(statusStr)
                || "COMPILATION_ERROR".equalsIgnoreCase(statusStr)) {
            return ExecutionHistory.ExecutionStatus.COMPILATION_ERROR;
        }
        if ("Accepted".equalsIgnoreCase(statusStr)
                || "SUCCESS".equalsIgnoreCase(statusStr)
                || (exitCode != null && exitCode == 0)) {
            return ExecutionHistory.ExecutionStatus.SUCCESS;
        }
        return ExecutionHistory.ExecutionStatus.FAILED;
    }

    private String mapStatus(ExecutionHistory h) {
        if (h.getStatus() == ExecutionHistory.ExecutionStatus.SERVICE_UNAVAILABLE
                || (h.getExitCode() != null && h.getExitCode() >= 500)) {
            return "Service unavailable";
        }
        if (h.getStatus() == ExecutionHistory.ExecutionStatus.TIMEOUT
                || (h.getExitCode() != null && h.getExitCode() == 124)) {
            return "Time Limit Exceeded";
        }
        if (h.getStatus() == ExecutionHistory.ExecutionStatus.COMPILATION_ERROR) {
            return "Compilation Error";
        }
        if (h.getStatus() == ExecutionHistory.ExecutionStatus.SUCCESS
                || (h.getExitCode() != null && h.getExitCode() == 0)) {
            return "Accepted";
        }
        if (h.getStatus() == ExecutionHistory.ExecutionStatus.QUEUED) {
            return "Queued";
        }
        if (h.getStatus() == ExecutionHistory.ExecutionStatus.RUNNING) {
            return "Running";
        }
        return "Runtime Error";
    }

    private ExecutionHistoryDTO toDTO(ExecutionHistory h) {
        return ExecutionHistoryDTO.builder()
                .id(h.getId())
                .language(h.getLanguage())
                .sourceCode(h.getSourceCode())
                .stdout(h.getStdout())
                .stderr(h.getStderr())
                .exitCode(h.getExitCode())
                .durationMs(h.getDurationMs())
                .executedAt(h.getExecutedAt())
                .status(mapStatus(h))
                .runByUsername(h.getRunBy() != null ? h.getRunBy().getUsername() : null)
                .runByEmail(h.getRunBy() != null ? h.getRunBy().getEmail() : null)
                .roomId(h.getRoom() != null ? h.getRoom().getId() : null)
                .roomName(h.getRoom() != null ? h.getRoom().getName() : null)
                .build();
    }
}
