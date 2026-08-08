package com.exaple.codeEditer.Code.Editor;

import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.repository.ExecutionHistoryRepository;
import com.exaple.codeEditer.Code.Editor.service.BusinessMetricsService;
import com.exaple.codeEditer.Code.Editor.service.ExecutionWorker;
import com.exaple.codeEditer.Code.Editor.service.execution.ExecutionProvider;
import com.exaple.codeEditer.Code.Editor.service.execution.ExecutionResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExecutionWorkerTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ListOperations<String, String> listOperations;

    @Mock
    private ExecutionHistoryRepository executionHistoryRepository;

    @Mock
    private ExecutionProvider executionProvider;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private BusinessMetricsService businessMetricsService;

    @InjectMocks
    private ExecutionWorker executionWorker;

    @Test
    void testProcessQueuesSuccess() throws Exception {
        UUID execId = UUID.randomUUID();
        UUID roomId = UUID.randomUUID();
        Room room = Room.builder().id(roomId).name("Test Room").build();

        ExecutionHistory history = ExecutionHistory.builder()
                .id(execId)
                .room(room)
                .language("java")
                .sourceCode("class Main {}")
                .status(ExecutionHistory.ExecutionStatus.QUEUED)
                .build();

        when(redisTemplate.opsForList()).thenReturn(listOperations);
        when(listOperations.leftPop("execution:queue:global")).thenReturn(execId.toString());
        when(executionHistoryRepository.findById(execId)).thenReturn(Optional.of(history));

        ExecutionResult result = ExecutionResult.builder()
                .stdout("Hello World")
                .stderr("")
                .exitCode(0)
                .durationMs(50)
                .status(ExecutionResult.Status.SUCCESS)
                .build();

        when(executionProvider.execute("java", "class Main {}", null)).thenReturn(result);

        executionWorker.processQueues();

        // Wait brief time for async executor pool task to finish
        Thread.sleep(300);

        verify(executionProvider, times(1)).execute("java", "class Main {}", null);
        verify(businessMetricsService, times(1)).incrementExecutionTotal();
    }
}
