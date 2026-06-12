package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.repository.ExecutionHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExecutionWorker {

    private final StringRedisTemplate redisTemplate;
    private final ExecutionHistoryRepository executionHistoryRepository;
    private final DockerWorkspaceService dockerWorkspaceService;

    private static final String HOST_WORKSPACES_DIR = System.getProperty("user.dir") + "/cloud-workspaces";

    @Scheduled(fixedDelay = 500)
    public void processQueues() {
        String queueKey = "execution:queue:global";
        
        // Pop the next execution
        String execId = redisTemplate.opsForList().leftPop(queueKey);
        if (execId == null) return;
        
        ExecutionHistory history = executionHistoryRepository.findById(UUID.fromString(execId)).orElse(null);
        if (history == null || history.getStatus() != ExecutionHistory.ExecutionStatus.QUEUED) return;

        String roomIdStr = history.getRoom().getId().toString();
        String lockKey = "execution:lock:" + roomIdStr;

        // Try to lock the room
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(20));
        if (Boolean.TRUE.equals(acquired)) {
            try {
                processExecution(roomIdStr, history);
            } finally {
                try {
                    redisTemplate.delete(lockKey);
                } catch (Exception e) {
                    // Ignore IllegalStateException during context shutdown
                }
            }
        } else {
            // Room is locked by another execution, re-enqueue at the end
            redisTemplate.opsForList().rightPush(queueKey, execId);
        }
    }

    @Scheduled(fixedDelay = 60000)
    public void recoverStuckExecutions() {
        // Find tasks stuck in RUNNING for more than 2 minutes (crashed nodes)
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(2);
        List<ExecutionHistory> stuck = executionHistoryRepository.findByStatusAndExecutedAtBefore(
            ExecutionHistory.ExecutionStatus.RUNNING, threshold);
            
        for (ExecutionHistory h : stuck) {
            h.setStatus(ExecutionHistory.ExecutionStatus.FAILED);
            h.setStdout(h.getStdout() + "\n[System: Execution failed due to worker crash]");
            executionHistoryRepository.save(h);
            log.warn("Recovered stuck execution {}", h.getId());
        }
    }

    private void processExecution(String roomId, ExecutionHistory history) {
        // 1. Mark as RUNNING
        history.setStatus(ExecutionHistory.ExecutionStatus.RUNNING);
        executionHistoryRepository.save(history);
        String execId = history.getId().toString();
        
        long startTime = System.currentTimeMillis();
        StringBuilder fullOutput = new StringBuilder();
        
        // 2. Generate command
        String lang = history.getLanguage().toLowerCase();
        String runCommand = "";
        String filename = "main.txt";

        switch (lang) {
            case "java":
                filename = "Main.java";
                runCommand = "javac Main.java && java Main";
                break;
            case "nodejs":
            case "javascript":
            case "js":
                filename = "index.js";
                runCommand = "node index.js";
                break;
            case "typescript":
            case "ts":
                filename = "index.ts";
                runCommand = "npx ts-node index.ts";
                break;
            case "python":
            case "python3":
            case "py":
                filename = "main.py";
                runCommand = "python3 main.py";
                break;
            case "cpp":
            case "c++":
                filename = "main.cpp";
                runCommand = "g++ -o main main.cpp && ./main";
                break;
            case "c":
                filename = "main.c";
                runCommand = "gcc -o main main.c && ./main";
                break;
            case "go":
            case "golang":
                filename = "main.go";
                runCommand = "go run main.go";
                break;
            case "rust":
            case "rs":
                filename = "main.rs";
                runCommand = "rustc main.rs -o main && ./main";
                break;
            case "kotlin":
            case "kt":
                filename = "main.kt";
                runCommand = "kotlinc main.kt -include-runtime -d main.jar && java -jar main.jar";
                break;
            case "csharp":
            case "cs":
                filename = "Program.cs";
                runCommand = "dotnet-script Program.cs";
                break;
            default:
                filename = "main.txt";
                runCommand = "cat main.txt";
                break;
        }

        try {
            // Write source code to the shared workspace directory
            Path execDir = Paths.get(HOST_WORKSPACES_DIR, roomId, ".exec", execId);
            Files.createDirectories(execDir);
            Path filePath = execDir.resolve(filename);
            Files.writeString(filePath, history.getSourceCode());

            // 3. Execute in ephemeral sandbox
            String isolatedCommand = "cd .exec/" + execId + " && " + runCommand;
            int exitCode = dockerWorkspaceService.runEphemeralSandbox(roomId, execId, isolatedCommand, fullOutput);
            
            history.setExitCode(exitCode);
            if (exitCode == 0) {
                history.setStatus(ExecutionHistory.ExecutionStatus.SUCCESS);
            } else if (fullOutput.toString().contains("[Execution Timeout")) {
                history.setStatus(ExecutionHistory.ExecutionStatus.TIMEOUT);
            } else {
                history.setStatus(ExecutionHistory.ExecutionStatus.FAILED);
            }
            try { Files.walk(execDir).sorted(java.util.Comparator.reverseOrder()).forEach(p -> p.toFile().delete()); }
            catch (Exception ignored) {}
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
