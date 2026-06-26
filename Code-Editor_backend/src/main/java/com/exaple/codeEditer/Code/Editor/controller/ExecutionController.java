package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.dto.ExecutionHistory.ExecutionHistoryDTO;
import com.exaple.codeEditer.Code.Editor.dto.piston.ExecuteRequest;
import com.exaple.codeEditer.Code.Editor.dto.piston.ExecuteResponse;
import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.repository.ExecutionHistoryRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{roomId}")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionRouterService executionRouterService;
    private final ExecutionHistoryRepository executionHistoryRepository;
    private final RoomRepository roomRepository;
    private static final Logger logger = LoggerFactory.getLogger(ExecutionController.class);
    private final RateLimitService rateLimitService;

    @PostMapping("/execute")
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

    @Transactional
    @GetMapping("/executions")
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
                 executionHistoryRepository.findByRoomOrderByExecutedAtDesc(room, pageable);
  
        Page<ExecutionHistoryDTO> dtos = histories.map(h -> ExecutionHistoryDTO.builder()
                .id(h.getId())
                .language(h.getLanguage())
                .sourceCode(h.getSourceCode())
                .stdout(h.getStdout())
                .stderr(h.getStderr())
                .exitCode(h.getExitCode())
                .durationMs(h.getDurationMs())
                .executedAt(h.getExecutedAt())
                .status(h.getExitCode() != null && h.getExitCode() == 0 ? "Accepted" : "Runtime Error")
                .runByUsername(h.getRunBy() != null ? h.getRunBy().getUsername() : null)
                .runByEmail(h.getRunBy() != null ? h.getRunBy().getEmail() : null)
                .roomId(h.getRoom() != null ? h.getRoom().getId() : null)
                .roomName(h.getRoom() != null ? h.getRoom().getName() : null)
                .build()
        );

        return ResponseEntity.ok(dtos);
    }
}