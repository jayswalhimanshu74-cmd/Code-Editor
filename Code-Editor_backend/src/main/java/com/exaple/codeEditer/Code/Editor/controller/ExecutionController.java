package com.exaple.codeEditer.Code.Editor.controller;



import com.exaple.codeEditer.Code.Editor.dto.piston.ExecuteRequest;
import com.exaple.codeEditer.Code.Editor.dto.piston.ExecuteResponse;
import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.repository.ExecutionHistoryRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import com.exaple.codeEditer.Code.Editor.service.PistonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{roomId}")
@RequiredArgsConstructor
public class ExecutionController {

    private final PistonService pistonService;
    private final ExecutionHistoryRepository executionHistoryRepository;
    private final RoomRepository roomRepository;

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

    @GetMapping("/executions")
    public ResponseEntity<List<ExecutionHistory>> getHistory(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        return ResponseEntity.ok(
                executionHistoryRepository
                        .findTop10ByRoomOrderByExecutedAtDesc(room)
        );
    }
}