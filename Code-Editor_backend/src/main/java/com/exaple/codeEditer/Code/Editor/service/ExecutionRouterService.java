package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.dto.piston.ExecuteRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.ExecutionHistoryRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;

import java.util.UUID;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExecutionRouterService {

    private final ExecutionQueueService executionQueueService;
    private final ExecutionHistoryRepository executionHistoryRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public String executeNative(UUID roomId, ExecuteRequest request, String email) {
        String lang = request.getLanguage().toLowerCase();
        String sourceCode = request.getSourceCode();
        
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));
            
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Create ExecutionHistory row with QUEUED state
        ExecutionHistory history = ExecutionHistory.builder()
            .room(room)
            .runBy(user)
            .language(lang)
            .sourceCode(sourceCode)
            .status(ExecutionHistory.ExecutionStatus.QUEUED)
            .executedAt(LocalDateTime.now())
            .build();
            
        history = executionHistoryRepository.save(history);
        String execId = history.getId().toString();

        // Enqueue to Redis
        executionQueueService.enqueueExecution(roomId, execId);

        return execId;
    }
}
