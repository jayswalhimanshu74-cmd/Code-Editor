
package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.repository.ExecutionHistoryRepository;
import com.exaple.codeEditer.Code.Editor.service.execution.ExecutionProvider;
import com.exaple.codeEditer.Code.Editor.service.execution.ExecutionResult;
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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExecutionWorker {

    private final StringRedisTemplate redisTemplate;
    private final ExecutionHistoryRepository executionHistoryRepository;
    private final ExecutionProvider executionProvider;
    private final BusinessMetricsService businessMetricsService;
    private final RedisPublisher redisPublisher;

    private final ExecutorService executorService =
            Executors.newFixedThreadPool(8);

    private final Semaphore executionSemaphore =
            new Semaphore(8);

    private static final String EXECUTION_QUEUE =
            "execution:queue:global";

    private static final int MAX_OUTPUT_LENGTH = 10_000;

    /**
     * Poll the global execution queue.
     */
    @Scheduled(fixedDelay = 200)
    public void processQueues() {

        if (!executionSemaphore.tryAcquire()) {
            return;
        }

        String execId = null;

        try {

            execId = redisTemplate
                    .opsForList()
                    .leftPop(EXECUTION_QUEUE);

            if (execId == null) {
                executionSemaphore.release();
                return;
            }

        } catch (Exception e) {

            executionSemaphore.release();

            log.error(
                    "Failed to pop execution from queue",e
            );

            return;
        }

        final String finalExecId = execId;

        executorService.submit(() -> {

            try {

                UUID executionId =
                        UUID.fromString(finalExecId);

                ExecutionHistory history =
                        executionHistoryRepository
                                .findById(executionId)
                                .orElse(null);

                if (history == null) {

                    log.warn(
                            "Execution {} not found in database",
                            finalExecId
                    );

                    return;
                }

                /*
                 * Prevent duplicate execution.
                 */
                if (history.getStatus()
                        != ExecutionHistory.ExecutionStatus.QUEUED) {

                    log.warn(
                            "Skipping execution {} because status is {}",
                            finalExecId,
                            history.getStatus()
                    );

                    return;
                }

                log.info(
                        "Processing execution request {} via ExecutionProvider",
                        finalExecId
                );

                /*
                 * ---------------------------------------------------------
                 * RUNNING
                 * ---------------------------------------------------------
                 */

                history.setStatus(
                        ExecutionHistory.ExecutionStatus.RUNNING
                );

                executionHistoryRepository.save(history);

                publishStatusUpdate(history);

                businessMetricsService.incrementExecutionTotal();

                long startTime =
                        System.currentTimeMillis();

                /*
                 * ---------------------------------------------------------
                 * EXECUTE THROUGH JUDGE0 PROVIDER
                 * ---------------------------------------------------------
                 */

                ExecutionResult result =
                        executionProvider.execute(
                                history.getLanguage(),
                                history.getSourceCode(),
                                null
                        );
                        log.info(
                            "Judge0 result for {} -> status={}, stdout={}, stderr={}, exitCode={}, durationMs={}",
                            finalExecId,
                            result.getStatus(),
                            result.getStdout(),
                            result.getStderr(),
                            result.getExitCode(),
                            result.getDurationMs()
                    );

                long duration =
                        System.currentTimeMillis()
                                - startTime;

                businessMetricsService
                        .recordExecutionTime(duration);

                /*
                 * ---------------------------------------------------------
                 * STORE RESULT
                 * ---------------------------------------------------------
                 */

                history.setStdout(
                        truncateOutput(result.getStdout())
                );

                history.setStderr(
                        truncateOutput(result.getStderr())
                );

                history.setExitCode(
                        result.getExitCode()
                );

                history.setDurationMs(
                        result.getDurationMs() != null
                                ? result.getDurationMs().intValue()
                                : (int) duration
                );

                /*
                 * ---------------------------------------------------------
                 * MAP EXECUTION STATUS
                 * ---------------------------------------------------------
                 */

                if (result.getStatus()
                        == ExecutionResult.Status.SUCCESS) {

                    history.setStatus(
                            ExecutionHistory.ExecutionStatus.SUCCESS
                    );

                } else if (result.getStatus()
                        == ExecutionResult.Status.TIMEOUT) {

                    history.setStatus(
                            ExecutionHistory.ExecutionStatus.TIMEOUT
                    );

                    businessMetricsService
                            .incrementExecutionFailures();

                } else {

                    history.setStatus(
                            ExecutionHistory.ExecutionStatus.FAILED
                    );

                    businessMetricsService
                            .incrementExecutionFailures();
                }

                /*
                 * ---------------------------------------------------------
                 * SAVE FINAL RESULT
                 * ---------------------------------------------------------
                 */

                executionHistoryRepository.save(history);

                /*
                 * ---------------------------------------------------------
                 * SEND FINAL RESULT TO FRONTEND
                 * ---------------------------------------------------------
                 */

                publishStatusUpdate(history);

                log.info(
                        "Execution {} completed with status {}",
                        finalExecId,
                        history.getStatus()
                );

            } catch (Exception e) {

                businessMetricsService
                        .incrementExecutionFailures();

                log.error(
                        "Execution error for {}",
                        finalExecId,
                        e
                );

                /*
                 * ---------------------------------------------------------
                 * CRITICAL FIX:
                 * NEVER leave an execution permanently RUNNING.
                 * ---------------------------------------------------------
                 */

                try {

                    ExecutionHistory failedExecution =
                            executionHistoryRepository
                                    .findById(
                                            UUID.fromString(finalExecId)
                                    )
                                    .orElse(null);

                    if (failedExecution != null) {

                        failedExecution.setStatus(
                                ExecutionHistory.ExecutionStatus.FAILED
                        );

                        failedExecution.setExitCode(1);

                        String errorMessage =
                                e.getMessage() != null
                                        ? e.getMessage()
                                        : "Unknown execution error";

                        failedExecution.setStderr(
                                truncateOutput(
                                        "[Execution Error] "
                                                + errorMessage
                                )
                        );

                        executionHistoryRepository
                                .save(failedExecution);

                        /*
                         * Tell the frontend that execution failed.
                         */
                        publishStatusUpdate(failedExecution);
                    }

                } catch (Exception updateException) {

                    log.error(
                            "Failed to mark execution {} as FAILED",
                            finalExecId,
                            updateException
                    );
                }

            } finally {

                executionSemaphore.release();
            }
        });
    }

    /**
     * Cleanup executions that remain queued for too long.
     */
    @Scheduled(fixedDelay = 60000)
    public void cleanupTimedOutExecutions() {

        try {

            LocalDateTime timeoutThreshold =
                    LocalDateTime.now()
                            .minusMinutes(2);

            List<ExecutionHistory> hangingQueued =
                    executionHistoryRepository
                            .findByStatusAndExecutedAtBefore(
                                    ExecutionHistory.ExecutionStatus.QUEUED,
                                    timeoutThreshold
                            );

            for (ExecutionHistory history : hangingQueued) {

                log.warn(
                        "Execution request {} timed out in queue. "
                                + "Marking as TIMEOUT.",
                        history.getId()
                );

                history.setStatus(
                        ExecutionHistory.ExecutionStatus.TIMEOUT
                );

                history.setStderr(
                        "[System Error]: "
                                + "Execution timed out in queue "
                                + "before processing."
                );

                executionHistoryRepository.save(history);

                publishStatusUpdate(history);
            }

        } catch (Exception e) {

            log.error(
                    "Failed to execute cleanup job for hanging executions",
                    e
            );
        }
    }

    /**
     * Publish execution status through the application's
     * existing Redis -> STOMP -> WebSocket pipeline.
     */
    private void publishStatusUpdate(
            ExecutionHistory history) {

        if (history.getRoom() == null) {
            log.warn(
                    "Cannot publish execution {} because room is null",
                    history.getId()
            );

            return;
        }

        try {

            /*
             * IMPORTANT:
             *
             * This is the destination the React client
             * must subscribe to.
             */
            String destination =
                    "/topic/room/"
                            + history.getRoom().getId()
                            + "/execution";

            Map<String, Object> event =
                    new HashMap<>();

            event.put(
                    "type",
                    "execution"
            );

            event.put(
                    "execId",
                    history.getId().toString()
            );

            event.put(
                    "status",
                    history.getStatus().toString()
            );

            event.put(
                    "stdout",
                    history.getStdout()
            );

            event.put(
                    "stderr",
                    history.getStderr()
            );

            event.put(
                    "exitCode",
                    history.getExitCode()
            );

            event.put(
                    "durationMs",
                    history.getDurationMs()
            );

            /*
             * Generic data field for frontend terminal output.
             */
            String stdout = history.getStdout();
            String stderr = history.getStderr();

            if (stdout != null && !stdout.isBlank()) {

                event.put(
                        "data",
                        stdout
                );

            } else if (stderr != null && !stderr.isBlank()) {

                event.put(
                        "data",
                        stderr
                );

            } else {

                event.put(
                        "data",
                        ""
                );
            }
            /*
             * IMPORTANT:
             *
             * Do NOT publish directly to:
             *
             * execution:events:{roomId}
             *
             * because the existing STOMP bridge does not
             * consume that channel.
             *
             * Use RedisPublisher so the message follows
             * the application's Redis -> STOMP pipeline.
             */
            redisPublisher.publish(
                    destination,
                    event
            );

            log.info(
                    "EXECUTION EVENT PUBLISHED: id={}, destination={}, status={}, stdout={}",
                    history.getId(),
                    destination,
                    history.getStatus(),
                    history.getStdout()
            );

        } catch (Exception e) {

            log.error(
                    "Failed to publish status update event for {}",
                    history.getId(),
                    e
            );
        }
    }

    /**
     * Prevent extremely large Judge0 output from
     * being stored/transmitted.
     */
    private String truncateOutput(String text) {

        if (text == null) {
            return null;
        }

        if (text.length() <= MAX_OUTPUT_LENGTH) {
            return text;
        }

        return text.substring(
                0,
                MAX_OUTPUT_LENGTH
        ) + "\n...[Output Truncated]";
    }
}
