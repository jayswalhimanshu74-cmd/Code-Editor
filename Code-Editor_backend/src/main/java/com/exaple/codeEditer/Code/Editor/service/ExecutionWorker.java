package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.repository.ExecutionHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExecutionWorker {

    private final StringRedisTemplate redisTemplate;
    private final ExecutionHistoryRepository executionHistoryRepository;
    private final DockerWorkspaceService dockerWorkspaceService;

    @Scheduled(fixedDelay = 500)
    public void processQueues() {
        // Find all room queues
        Set<String> queueKeys = redisTemplate.keys("execution:queue:*");
        if (queueKeys == null || queueKeys.isEmpty()) return;

        for (String queueKey : queueKeys) {
            String roomIdStr = queueKey.replace("execution:queue:", "");
            String lockKey = "execution:lock:" + roomIdStr;

            // Try to lock the room so only one execution runs per room concurrently across all nodes
            Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(20));
            if (Boolean.TRUE.equals(acquired)) {
                try {
                    // Pop the next execution
                    String execId = redisTemplate.opsForList().leftPop(queueKey);
                    if (execId != null) {
                        processExecution(roomIdStr, execId);
                    }
                } finally {
                    redisTemplate.delete(lockKey);
                }
            }
        }
    }

    private void processExecution(String roomId, String execId) {
        ExecutionHistory history = executionHistoryRepository.findById(UUID.fromString(execId)).orElse(null);
        if (history == null || history.getStatus() != ExecutionHistory.ExecutionStatus.QUEUED) return;

        // 1. Mark as RUNNING
        history.setStatus(ExecutionHistory.ExecutionStatus.RUNNING);
        executionHistoryRepository.save(history);
        
        long startTime = System.currentTimeMillis();
        StringBuilder fullOutput = new StringBuilder();
        
        // 2. Generate command
        String lang = history.getLanguage().toLowerCase();
        String runCommand = "";
        switch (lang) {
            case "java":
                runCommand = "javac Main.java && java Main";
                break;
            case "nodejs":
            case "javascript":
            case "js":
                runCommand = "node index.js";
                break;
            case "python":
            case "python3":
            case "py":
                runCommand = "python3 main.py";
                break;
            default:
                runCommand = "cat main.txt";
                break;
        }

        try {
            // 3. Execute in ephemeral sandbox
            dockerWorkspaceService.runEphemeralSandbox(roomId, execId, runCommand, fullOutput);
            
            history.setStatus(ExecutionHistory.ExecutionStatus.SUCCESS);
        } catch (Exception e) {
            log.error("Execution failed for {}: {}", execId, e.getMessage());
            history.setStatus(ExecutionHistory.ExecutionStatus.FAILED);
            fullOutput.append("\n[Internal System Error: ").append(e.getMessage()).append("]");
        }

        // 4. Save terminal state
        long duration = System.currentTimeMillis() - startTime;
        history.setDurationMs((int) duration);
        history.setStdout(fullOutput.toString());
        executionHistoryRepository.save(history);
    }
}
