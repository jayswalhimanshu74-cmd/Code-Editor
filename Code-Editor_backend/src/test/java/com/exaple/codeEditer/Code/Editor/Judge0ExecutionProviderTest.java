package com.exaple.codeEditer.Code.Editor;

import com.exaple.codeEditer.Code.Editor.service.execution.ExecutionResult;
import com.exaple.codeEditer.Code.Editor.service.execution.Judge0ExecutionProvider;
import com.exaple.codeEditer.Code.Editor.service.execution.Judge0LanguageMapper;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Judge0ExecutionProviderTest {

    @Mock
    private Judge0LanguageMapper languageMapper;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private Judge0ExecutionProvider provider;

    
    private HttpServer mockHttpServer;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(provider, "judge0Url", "http://localhost:2358/submissions?wait=true");
        ReflectionTestUtils.setField(provider, "judge0Mode", "rapidapi");
        ReflectionTestUtils.setField(provider, "judge0Key", "test-api-key");
        ReflectionTestUtils.setField(provider, "judge0Host", "test-host");
        ReflectionTestUtils.setField(provider, "timeoutMs", 5000);
        ReflectionTestUtils.setField(provider, "connectTimeoutMs", 5000);
        ReflectionTestUtils.setField(provider, "readTimeoutBufferMs", 5000);
        ReflectionTestUtils.setField(provider, "defaultMemoryLimitKb", 128000);
        ReflectionTestUtils.setField(provider, "defaultCpuTimeLimitSec", 5.0);
        ReflectionTestUtils.setField(provider, "restTemplate", restTemplate);
    }

    @AfterEach
    void tearDown() {
        if (mockHttpServer != null) {
            mockHttpServer.stop(0);
        }
    }

    @Test
    void testProviderName() {
        assertEquals("Judge0ExecutionProvider", provider.getProviderName());
    }

    @Test
    void testFallbackExecute() {
        RuntimeException ex = new RuntimeException("Judge0 Server Unreachable");
        ExecutionResult result = provider.fallbackExecute("java", "class Main {}", "", ex);

        assertNotNull(result);
        assertEquals(ExecutionResult.Status.ERROR, result.getStatus());
        assertEquals(503, result.getExitCode());
        assertTrue(result.getStderr().contains("Judge0 Server Unreachable"));
    }

    @Test
    void testUnsupportedLanguageReturnsErrorResult() {
        when(languageMapper.getLanguageId("invalid"))
                .thenThrow(new IllegalArgumentException("Unsupported language"));

        ExecutionResult result = provider.execute("invalid", "print(1)", "");

        assertNotNull(result);
        assertEquals(ExecutionResult.Status.ERROR, result.getStatus());
        assertEquals(400, result.getExitCode());
        assertTrue(result.getStderr().contains("Unsupported language"));
    }

    @Test
    void testInitDoesNotThrowException() {
        assertDoesNotThrow(() -> provider.init());
    }

    @Test
    void testExecuteWithMissingKeyReturnsErrorResult() {
        ReflectionTestUtils.setField(provider, "judge0Key", "");
        ExecutionResult result = provider.execute("java", "class Main {}", "");

        assertNotNull(result);
        assertEquals(ExecutionResult.Status.ERROR, result.getStatus());
        assertEquals(401, result.getExitCode());
        assertEquals("Judge0 API key is not configured.", result.getStderr());
    }

    @Test
    void testExecuteWithPlaceholderKeyReturnsErrorResult() {
        ReflectionTestUtils.setField(provider, "judge0Key", "YOUR_JUDGE0_API_KEY");
        ExecutionResult result = provider.execute("java", "class Main {}", "");

        assertNotNull(result);
        assertEquals(ExecutionResult.Status.ERROR, result.getStatus());
        assertEquals(401, result.getExitCode());
        assertEquals("Judge0 API key is not configured.", result.getStderr());
    }

    @Test
    void testExecuteWith401UnauthorizedReturnsErrorResult() {
        when(languageMapper.getLanguageId("java")).thenReturn(62);
        HttpClientErrorException ex = HttpClientErrorException.create(
                HttpStatus.UNAUTHORIZED, "Unauthorized", null, null, null);

        when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(ex);

        ExecutionResult result = provider.execute("java", "class Main {}", "");

        assertNotNull(result);
        assertEquals(ExecutionResult.Status.ERROR, result.getStatus());
        assertEquals(401, result.getExitCode());
        assertTrue(result.getStderr().contains("unauthorized or subscription is inactive"));
    }

    @Test
    void testExecuteWith403ForbiddenReturnsErrorResult() {
        when(languageMapper.getLanguageId("java")).thenReturn(62);
        HttpClientErrorException ex = HttpClientErrorException.create(
                HttpStatus.FORBIDDEN, "Forbidden", null, null, null);

        when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(ex);

        ExecutionResult result = provider.execute("java", "class Main {}", "");

        assertNotNull(result);
        assertEquals(ExecutionResult.Status.ERROR, result.getStatus());
        assertEquals(403, result.getExitCode());
        assertTrue(result.getStderr().contains("unauthorized or subscription is inactive"));
    }

    @Test
    void testExecuteWith400BadRequestReturnsErrorResult() {
        when(languageMapper.getLanguageId("java")).thenReturn(62);
        HttpClientErrorException ex = HttpClientErrorException.create(
                HttpStatus.BAD_REQUEST, "Bad Request", null, null, null);

        when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(ex);

        ExecutionResult result = provider.execute("java", "class Main {}", "");

        assertNotNull(result);
        assertEquals(ExecutionResult.Status.ERROR, result.getStatus());
        assertEquals(400, result.getExitCode());
        assertTrue(result.getStderr().contains("Invalid request sent to Judge0"));
    }

    @Test
    void testExecuteWith429RateLimitThrowsResourceAccessException() {
        when(languageMapper.getLanguageId("java")).thenReturn(62);
        HttpClientErrorException ex = HttpClientErrorException.create(
                HttpStatus.TOO_MANY_REQUESTS, "Too Many Requests", null, null, null);

        when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(ex);

        assertThrows(ResourceAccessException.class, () -> {
            provider.execute("java", "class Main {}", "");
        });
    }

    @Test
    void testExecuteWith500ServerErrorThrowsResourceAccessException() {
        when(languageMapper.getLanguageId("java")).thenReturn(62);
        HttpServerErrorException ex = HttpServerErrorException.create(
                HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", null, null, null);

        when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(ex);

        assertThrows(ResourceAccessException.class, () -> {
            provider.execute("java", "class Main {}", "");
        });
    }

    @Test
    void testStatusIdMappings() {
        when(languageMapper.getLanguageId("java")).thenReturn(62);

        // Map status ID 4: Memory Limit Exceeded
        Map<String, Object> body4 = new HashMap<>();
        body4.put("stdout", "");
        body4.put("stderr", "");
        body4.put("compile_output", "");
        body4.put("exit_code", 139);
        Map<String, Object> statusObj4 = new HashMap<>();
        statusObj4.put("id", 4);
        statusObj4.put("description", "Memory Limit Exceeded");
        body4.put("status", statusObj4);

        when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(new ResponseEntity<>(body4, HttpStatus.OK));

        ExecutionResult result4 = provider.execute("java", "class Main {}", "");
        assertEquals(ExecutionResult.Status.FAILED, result4.getStatus());
        assertTrue(result4.getStderr().contains("Memory Limit Exceeded"));

        // Map status ID 5: Time Limit Exceeded
        Map<String, Object> body5 = new HashMap<>();
        body5.put("stdout", "");
        body5.put("stderr", "");
        body5.put("compile_output", "");
        body5.put("exit_code", 124);
        Map<String, Object> statusObj5 = new HashMap<>();
        statusObj5.put("id", 5);
        statusObj5.put("description", "Time Limit Exceeded");
        body5.put("status", statusObj5);

        reset(restTemplate);
        when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(new ResponseEntity<>(body5, HttpStatus.OK));

        ExecutionResult result5 = provider.execute("java", "class Main {}", "");
        assertEquals(ExecutionResult.Status.TIMEOUT, result5.getStatus());
        assertTrue(result5.getStderr().contains("Time Limit Exceeded"));

        // Map status ID 14: Internal Error
        Map<String, Object> body14 = new HashMap<>();
        body14.put("stdout", "");
        body14.put("stderr", "");
        body14.put("compile_output", "");
        body14.put("exit_code", 1);
        Map<String, Object> statusObj14 = new HashMap<>();
        statusObj14.put("id", 14);
        statusObj14.put("description", "Internal Error");
        body14.put("status", statusObj14);

        reset(restTemplate);
        when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(new ResponseEntity<>(body14, HttpStatus.OK));

        ExecutionResult result14 = provider.execute("java", "class Main {}", "");
        assertEquals(ExecutionResult.Status.ERROR, result14.getStatus());
        assertTrue(result14.getStderr().contains("Judge0 Internal Error"));
    }

    @Test
    void testReadTimeoutOnSlowEndpointThrowsResourceAccessException() throws IOException {
        // Start a mock HTTP server that delays response by 2000ms
        mockHttpServer = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        mockHttpServer.createContext("/submissions", exchange -> {
            try {
                Thread.sleep(2000);
            } catch (InterruptedException ignored) {}
            byte[] body = "{\"stdout\":\"ok\",\"status\":{\"id\":3}}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        mockHttpServer.start();

        int port = mockHttpServer.getAddress().getPort();
        String serverUrl = "http://127.0.0.1:" + port + "/submissions?wait=true";

        Judge0ExecutionProvider realProvider = new Judge0ExecutionProvider(new Judge0LanguageMapper());
        ReflectionTestUtils.setField(realProvider, "judge0Url", serverUrl);
        ReflectionTestUtils.setField(realProvider, "judge0Mode", "rapidapi");
        ReflectionTestUtils.setField(realProvider, "judge0Key", "test-api-key");
        ReflectionTestUtils.setField(realProvider, "judge0Host", "test-host");
        ReflectionTestUtils.setField(realProvider, "connectTimeoutMs", 1000);
        ReflectionTestUtils.setField(realProvider, "timeoutMs", 100);
        ReflectionTestUtils.setField(realProvider, "readTimeoutBufferMs", 100); // read timeout total = 200ms
        realProvider.init(); // initializes RestTemplate with 200ms read timeout

        long start = System.currentTimeMillis();
        assertThrows(ResourceAccessException.class, () -> {
            realProvider.execute("java", "public class Main {}", "");
        });
        long elapsed = System.currentTimeMillis() - start;

        // Confirm call timed out quickly (much less than the 2000ms server sleep)
        assertTrue(elapsed < 1500, "Expected call to time out in ~200ms, but took " + elapsed + "ms");
    }

    @Test
    void testSuccessfulExecutionWithRealClientAndMockServer() throws IOException {
        mockHttpServer = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        mockHttpServer.createContext("/submissions", exchange -> {
            byte[] body = "{\"stdout\":\"Hello World\\n\",\"stderr\":\"\",\"exit_code\":0,\"status\":{\"id\":3}}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        mockHttpServer.start();

        int port = mockHttpServer.getAddress().getPort();
        String serverUrl = "http://127.0.0.1:" + port + "/submissions?wait=true";

        Judge0ExecutionProvider realProvider = new Judge0ExecutionProvider(new Judge0LanguageMapper());
        ReflectionTestUtils.setField(realProvider, "judge0Url", serverUrl);
        ReflectionTestUtils.setField(realProvider, "judge0Mode", "rapidapi");
        ReflectionTestUtils.setField(realProvider, "judge0Key", "test-api-key");
        ReflectionTestUtils.setField(realProvider, "judge0Host", "test-host");
        ReflectionTestUtils.setField(realProvider, "connectTimeoutMs", 2000);
        ReflectionTestUtils.setField(realProvider, "timeoutMs", 5000);
        ReflectionTestUtils.setField(realProvider, "readTimeoutBufferMs", 5000);
        realProvider.init();

        ExecutionResult result = realProvider.execute("java", "System.out.println(\"Hello World\");", "");

        assertNotNull(result);
        assertEquals(ExecutionResult.Status.SUCCESS, result.getStatus());
        assertEquals("Hello World\n", result.getStdout());
        assertEquals(0, result.getExitCode());
    }

    @Test
    void testExecuteInSelfHostedModeDoesNotRequireKeyAndOmitsHeaders() {
        ReflectionTestUtils.setField(provider, "judge0Mode", "self-hosted");
        ReflectionTestUtils.setField(provider, "judge0Key", ""); // empty key
        
        when(languageMapper.getLanguageId("java")).thenReturn(62);
        
        Map<String, Object> body = new HashMap<>();
        body.put("stdout", "SGVsbG8gV29ybGQ="); // Hello World base64
        body.put("stderr", "");
        body.put("exit_code", 0);
        Map<String, Object> statusObj = new HashMap<>();
        statusObj.put("id", 3);
        statusObj.put("description", "Accepted");
        body.put("status", statusObj);
        
        when(restTemplate.exchange(
                anyString(),
                any(HttpMethod.class),
                argThat(entity -> {
                    HttpHeaders headers = entity.getHeaders();
                    return !headers.containsKey("X-RapidAPI-Key") && !headers.containsKey("X-RapidAPI-Host");
                }),
                eq(Map.class)
        )).thenReturn(new ResponseEntity<>(body, HttpStatus.OK));
        
        ExecutionResult result = provider.execute("java", "System.out.println(\"Hello World\");", "");
        
        assertNotNull(result);
        assertEquals(ExecutionResult.Status.SUCCESS, result.getStatus());
        assertEquals("Hello World", result.getStdout().trim());
        assertEquals(0, result.getExitCode());
    }
}

