package com.exaple.codeEditer.Code.Editor;

import com.exaple.codeEditer.Code.Editor.service.execution.ExecutionResult;
import com.exaple.codeEditer.Code.Editor.service.execution.PistonExecutionProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class PistonExecutionProviderTest {

    @InjectMocks
    private PistonExecutionProvider provider;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(provider, "pistonUrl", "http://localhost:20000/api/v2/piston/execute");
    }

    @Test
    void testProviderName() {
        assertEquals("PistonExecutionProvider", provider.getProviderName());
    }

    @Test
    void testFallbackExecute() {
        RuntimeException ex = new RuntimeException("Connection refused");
        ExecutionResult result = provider.fallbackExecute("java", "System.out.println(1);", "", ex);

        assertNotNull(result);
        assertEquals(ExecutionResult.Status.ERROR, result.getStatus());
        assertEquals(503, result.getExitCode());
        assertTrue(result.getStderr().contains("Connection refused"));
    }

    @Test
    void testInitDoesNotThrowException() {
        assertDoesNotThrow(() -> provider.init());
    }
}
