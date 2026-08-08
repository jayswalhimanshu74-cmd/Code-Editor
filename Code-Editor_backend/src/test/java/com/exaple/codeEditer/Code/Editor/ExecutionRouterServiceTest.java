package com.exaple.codeEditer.Code.Editor;

import com.exaple.codeEditer.Code.Editor.dto.piston.ExecuteRequest;
import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.ExecutionHistoryRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import com.exaple.codeEditer.Code.Editor.service.ExecutionQueueService;
import com.exaple.codeEditer.Code.Editor.service.ExecutionRouterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExecutionRouterServiceTest {

    @Mock
    private ExecutionQueueService executionQueueService;

    @Mock
    private ExecutionHistoryRepository executionHistoryRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ExecutionRouterService executionRouterService;

    private UUID roomId;
    private User testUser;
    private Room testRoom;

    @BeforeEach
    void setUp() {
        roomId = UUID.randomUUID();
        testUser = User.builder().id(UUID.randomUUID()).email("user@example.com").username("testuser").build();
        testRoom = Room.builder().id(roomId).name("Test Room").build();
    }

    @Test
    void testExecuteNativeSuccess() {
        ExecuteRequest request = new ExecuteRequest();
        request.setLanguage("java");
        request.setSourceCode("public class Main { public static void main(String[] args) {} }");
        request.setStdin("hello input");

        when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(testUser));

        UUID historyId = UUID.randomUUID();
        ExecutionHistory savedHistory = ExecutionHistory.builder()
                .id(historyId)
                .room(testRoom)
                .runBy(testUser)
                .language("java")
                .sourceCode(request.getSourceCode())
                .status(ExecutionHistory.ExecutionStatus.QUEUED)
                .build();

        when(executionHistoryRepository.save(any(ExecutionHistory.class))).thenReturn(savedHistory);

        String execId = executionRouterService.executeNative(roomId, request, "user@example.com");

        assertEquals(historyId.toString(), execId);
        verify(executionQueueService, times(1)).enqueueExecution(roomId, execId);
    }
}
