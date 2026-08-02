package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.repository.ExecutionHistoryRepository;
import com.exaple.codeEditer.Code.Editor.service.execution.ExecutionProvider;
import com.exaple.codeEditer.Code.Editor.service.execution.ExecutionResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExecutionWorker {

    private final StringRedisTemplate redisTemplate;
    private final ExecutionHistoryRepository executionHistoryRepository;
    private final ExecutionProvider executionProvider;
    private final ObjectMapper objectMapper;
    private final BusinessMetricsService businessMetricsService;

    private final java.util.concurrent.ExecutorService executorService = java.util.concurrent.Executors.newFixedThreadPool(8);
    private final java.util.concurrent.Semaphore executionSemaphore = new java.util.concurrent.Semaphore(8);

    @Scheduled(fixedDelay = 200)
    public void processQueues() {
        if (!executionSemaphore.tryAcquire()) {
            return;
        }

        String queueKey = "execution:queue:global";
        String execId = null;
        try {
            execId = redisTemplate.opsForList().leftPop(queueKey);
            if (execId == null) {
                executionSemaphore.release();
                return;
            }
        } catch (Exception e) {
            executionSemaphore.release();
            log.error("Failed to pop from execution queue: {}", e.getMessage());
            return;
        }

        final String finalExecId = execId;
        executorService.submit(() -> {
            try {
                ExecutionHistory history = executionHistoryRepository.findById(UUID.fromString(finalExecId)).orElse(null);
                if (history == null || history.getStatus() != ExecutionHistory.ExecutionStatus.QUEUED) {
                    return;
                }

                log.info("Processing execution request {} via ExecutionProvider", finalExecId);
                history.setStatus(ExecutionHistory.ExecutionStatus.RUNNING);
                executionHistoryRepository.save(history);
                publishStatusUpdate(history);

                businessMetricsService.incrementExecutionTotal();
                long startTime = System.currentTimeMillis();

                ExecutionResult result = executionProvider.execute(
                        history.getLanguage(),
                        history.getSourceCode(),
                        null
                );

                long duration = System.currentTimeMillis() - startTime;
                businessMetricsService.recordExecutionTime(duration);

                history.setStdout(truncateOutput(result.getStdout()));
                history.setStderr(truncateOutput(result.getStderr()));
                history.setExitCode(result.getExitCode());
                history.setDurationMs(result.getDurationMs() != null ? result.getDurationMs().intValue() : (int) duration);

                if (result.getStatus() == ExecutionResult.Status.SUCCESS) {
                    history.setStatus(ExecutionHistory.ExecutionStatus.SUCCESS);
                } else if (result.getStatus() == ExecutionResult.Status.TIMEOUT) {
                    history.setStatus(ExecutionHistory.ExecutionStatus.TIMEOUT);
                    businessMetricsService.incrementExecutionFailures();
                } else {
                    history.setStatus(ExecutionHistory.ExecutionStatus.FAILED);
                    businessMetricsService.incrementExecutionFailures();
                }

                executionHistoryRepository.save(history);
                publishStatusUpdate(history);

            } catch (Exception e) {
                businessMetricsService.incrementExecutionFailures();
                log.error("Execution error for {}", finalExecId, e);
            } finally {
                executionSemaphore.release();
            }
        });
    }

    @Scheduled(fixedDelay = 60000)
    public void cleanupTimedOutExecutions() {
        try {
            LocalDateTime timeoutThreshold = LocalDateTime.now().minusMinutes(2);
            List<ExecutionHistory> hangingQueued = executionHistoryRepository.findByStatusAndExecutedAtBefore(
                    ExecutionHistory.ExecutionStatus.QUEUED, timeoutThreshold
            );

            for (ExecutionHistory history : hangingQueued) {
                log.warn("Execution request {} timed out in queue. Marking as TIMEOUT.", history.getId());
                history.setStatus(ExecutionHistory.ExecutionStatus.TIMEOUT);
                history.setStderr("[System Error]: Execution timed out in queue before processing.");
                executionHistoryRepository.save(history);
                publishStatusUpdate(history);
            }
        } catch (Exception e) {
            log.error("Failed to execute cleanup job for hanging executions", e);
        }
    }

    private void publishStatusUpdate(ExecutionHistory history) {
        if (history.getRoom() == null) return;
        try {
            String topic = "execution:events:" + history.getRoom().getId();
            Map<String, Object> event = new HashMap<>();
            event.put("id", history.getId());
            event.put("status", history.getStatus().toString());
            event.put("stdout", history.getStdout());
            event.put("stderr", history.getStderr());
            event.put("exitCode", history.getExitCode());
            event.put("durationMs", history.getDurationMs());

            String message = objectMapper.writeValueAsString(event);
            redisTemplate.convertAndSend(topic, message);
        } catch (Exception e) {
            log.error("Failed to publish status update event for {}", history.getId(), e);
        }
    }

    private String truncateOutput(String text) {
        if (text == null) return null;
        int maxLen = 10000;
        if (text.length() > maxLen) {
            return text.substring(0, maxLen) + "\n...[Output Truncated]";
        }
        return text;
    }
}
