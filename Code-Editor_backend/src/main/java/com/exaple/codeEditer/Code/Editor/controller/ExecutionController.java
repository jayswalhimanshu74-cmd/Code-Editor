package com.exaple.codeEditer.Code.Editor.controller;



import com.exaple.codeEditer.Code.Editor.dto.ExecutionHistory.ExecutionHistoryDTO;
import com.exaple.codeEditer.Code.Editor.dto.piston.ExecuteRequest;
import com.exaple.codeEditer.Code.Editor.dto.piston.ExecuteResponse;
import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.repository.ExecutionHistoryRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import com.exaple.codeEditer.Code.Editor.service.PistonService;

import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{roomId}")
@RequiredArgsConstructor
public class ExecutionController {

    private final PistonService pistonService;
    private final ExecutionHistoryRepository executionHistoryRepository;
    private final RoomRepository roomRepository;
    private static final Logger logger = LoggerFactory.getLogger(ExecutionController.class);

    @PostMapping("/execute")
    public ResponseEntity<ExecuteResponse> execute(
            @PathVariable UUID roomId,
            @Valid @RequestBody ExecuteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {


    if (userDetails == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    
        return ResponseEntity.ok(
                pistonService.execute(roomId, request, userDetails.getUsername())
        );
    }

   @Transactional
@GetMapping("/executions")
public ResponseEntity<List<ExecutionHistoryDTO>> getHistory(
        @PathVariable UUID roomId,
        @AuthenticationPrincipal UserDetails userDetails) {

    Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));

    List<ExecutionHistory> histories =
            executionHistoryRepository.findTop10ByRoomOrderByExecutedAtDesc(room);

    List<ExecutionHistoryDTO> dtos = histories.stream()
            .map(h -> ExecutionHistoryDTO.builder()
                    .id(h.getId())
                    .language(h.getLanguage())
                    .sourceCode(h.getSourceCode())
                    .stdout(h.getStdout())
                    .stderr(h.getStderr())
                    .exitCode(h.getExitCode())
                    .durationMs(h.getDurationMs())
                    .executedAt(h.getExecutedAt())
                    .status(h.getExitCode() != null && h.getExitCode() == 0
                            ? "Accepted" : "Runtime Error")
                    .runByUsername(h.getRunBy() != null
                            ? h.getRunBy().getUsername() : null)
                    .runByEmail(h.getRunBy() != null
                            ? h.getRunBy().getEmail() : null)
                    .roomId(h.getRoom() != null
                            ? h.getRoom().getId() : null)
                    .roomName(h.getRoom() != null
                            ? h.getRoom().getName() : null)
                    .build()
            )
            .toList();

    return ResponseEntity.ok(dtos);
  }
}