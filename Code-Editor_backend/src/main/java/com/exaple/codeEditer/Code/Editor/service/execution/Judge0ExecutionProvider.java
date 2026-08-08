package com.exaple.codeEditer.Code.Editor.service.execution;

import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service("judge0ExecutionProvider")
@Slf4j
public class Judge0ExecutionProvider implements ExecutionProvider {

    @Value("${execution.judge0.url:https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true}")
    private String judge0Url;

    @Value("${execution.judge0.mode:self-hosted}")
    private String judge0Mode = "self-hosted";

    @Value("${execution.judge0.key:}")
    private String judge0Key;

    @Value("${execution.judge0.host:judge0-ce.p.rapidapi.com}")
    private String judge0Host;

    @Value("${execution.judge0.timeout:10000}")
    private int timeoutMs;

    @Value("${execution.judge0.connect-timeout:5000}")
    private int connectTimeoutMs;

    @Value("${execution.judge0.read-timeout-buffer:5000}")
    private int readTimeoutBufferMs;

    @Value("${execution.judge0.memory:128000}")
    private int defaultMemoryLimitKb;

    @Value("${execution.judge0.cpu:5.0}")
    private double defaultCpuTimeLimitSec;

    @Value("${execution.provider:judge0}")
    private String activeProvider;

    private RestTemplate restTemplate;

    @Autowired(required = false)
    private Judge0LanguageMapper languageMapper;

    public Judge0ExecutionProvider() {
    }

    public Judge0ExecutionProvider(Judge0LanguageMapper languageMapper) {
        this.languageMapper = languageMapper;
    }

    @PostConstruct
    public void init() {
        if (this.restTemplate == null) {
            initRestTemplate();
        }

        boolean urlConfigured = judge0Url != null && !judge0Url.isBlank();
        boolean keyConfigured = isKeyConfigured();
        boolean hostConfigured = judge0Host != null && !judge0Host.isBlank();
        boolean timeoutConfigured = timeoutMs > 0;

        log.info("========================================================================");
        log.info(" Judge0 Configuration Report:");
        log.info(" Mode: {}", judge0Mode);
        log.info(" URL configured: {}", urlConfigured);
        log.info(" API key configured: {}", keyConfigured);
        log.info(" Host configured: {}", hostConfigured);
        log.info(" Timeout configured: {}", timeoutConfigured);
        log.info("========================================================================");

        if ("judge0".equalsIgnoreCase(activeProvider)) {
            if ("rapidapi".equalsIgnoreCase(judge0Mode) && !keyConfigured) {
                log.error("CRITICAL CONFIGURATION ERROR: Judge0 API Key is missing/unconfigured and Judge0 is the active execution provider!");
                throw new IllegalStateException("Startup halted: Judge0 API Key is missing.");
            }
        }
    }

    public void initRestTemplate() {
        int readTimeout = getReadTimeoutMs();
        log.info("Initializing Judge0 RestTemplate with connectTimeout={}ms, readTimeout={}ms",
                connectTimeoutMs, readTimeout);
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeoutMs);
        factory.setReadTimeout(readTimeout);
        this.restTemplate = new RestTemplate(factory);
    }

    public int getReadTimeoutMs() {
        return timeoutMs + readTimeoutBufferMs;
    }

    private boolean isKeyConfigured() {
        return judge0Key != null &&
               !judge0Key.isBlank() &&
               !judge0Key.trim().equals("YOUR_JUDGE0_API_KEY") &&
               !judge0Key.trim().equals("placeholder");
    }

    @Override
    @CircuitBreaker(name = "executionProvider", fallbackMethod = "fallbackExecute")
    @Retry(name = "executionProvider", fallbackMethod = "fallbackExecute")
    @Bulkhead(name = "executionProvider", fallbackMethod = "fallbackExecute")
    public ExecutionResult execute(String language, String sourceCode, String stdin) {
        log.info("Executing code via Judge0 API for language: {}", language);
        long startTime = System.currentTimeMillis();

        if ("rapidapi".equalsIgnoreCase(judge0Mode) && !isKeyConfigured()) {
            log.warn("Judge0 key is not configured. Rejecting code execution.");
            return ExecutionResult.builder()
                    .stdout("")
                    .stderr("Judge0 API key is not configured.")
                    .exitCode(401)
                    .durationMs(0)
                    .status(ExecutionResult.Status.ERROR)
                    .build();
        }

        try {
            int languageId = getJudge0LanguageId(language);

            Map<String, Object> requestBody = new HashMap<>();
            String safeSourceCode = sourceCode != null ? sourceCode : "";
            String safeStdin = stdin != null ? stdin : "";

            String encodedSourceCode = Base64.getEncoder()
                    .encodeToString(safeSourceCode.getBytes(StandardCharsets.UTF_8));

            String encodedStdin = Base64.getEncoder()
                    .encodeToString(safeStdin.getBytes(StandardCharsets.UTF_8));

            requestBody.put("source_code", encodedSourceCode);
            requestBody.put("language_id", languageId);
            requestBody.put("stdin", encodedStdin);
            requestBody.put("cpu_time_limit", defaultCpuTimeLimitSec);
            requestBody.put("memory_limit", defaultMemoryLimitKb);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if ("rapidapi".equalsIgnoreCase(judge0Mode)) {
                headers.set("X-RapidAPI-Key", judge0Key.trim());
                headers.set("X-RapidAPI-Host", judge0Host != null ? judge0Host.trim() : "");
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(judge0Url, HttpMethod.POST, entity, Map.class);
            long duration = System.currentTimeMillis() - startTime;

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                String stdout = decodeJudge0Field(body.get("stdout"));
                String stderr = decodeJudge0Field(body.get("stderr"));
                String compileOutput = decodeJudge0Field(body.get("compile_output"));

                if (!compileOutput.isEmpty()) {
                    stderr = stderr.isEmpty() ? compileOutput : stderr + "\n" + compileOutput;
                }

                Integer exitCode = body.get("exit_code") != null ? ((Number) body.get("exit_code")).intValue() : 0;
                
                Map statusObj = (Map) body.get("status");
                Integer statusId = statusObj != null && statusObj.get("id") != null ? ((Number) statusObj.get("id")).intValue() : 3;
                String statusDesc = statusObj != null && statusObj.get("description") != null ? statusObj.get("description").toString() : "Unknown";

                ExecutionResult.Status status;
                if (statusId == 3) {
                    status = ExecutionResult.Status.SUCCESS;
                } else if (statusId == 5) {
                    status = ExecutionResult.Status.TIMEOUT;
                    stderr = stderr.isEmpty() ? "Time Limit Exceeded" : stderr + "\nTime Limit Exceeded";
                } else if (statusId == 4) {
                    status = ExecutionResult.Status.FAILED;
                    stderr = stderr.isEmpty() ? "Memory Limit Exceeded" : stderr + "\nMemory Limit Exceeded";
                } else if (statusId == 6) {
                    status = ExecutionResult.Status.FAILED;
                } else if (statusId >= 7 && statusId <= 12) {
                    status = ExecutionResult.Status.FAILED;
                    String reMsg = "Runtime Error (" + statusDesc + ")";
                    stderr = stderr.isEmpty() ? reMsg : stderr + "\n" + reMsg;
                } else if (statusId == 14) {
                    status = ExecutionResult.Status.ERROR;
                    stderr = stderr.isEmpty() ? "Judge0 Internal Error" : stderr + "\nJudge0 Internal Error";
                } else {
                    status = ExecutionResult.Status.FAILED;
                }

                log.info("Judge0 execution completed in {}ms with status={} and exitCode={}", duration, status, exitCode);
                return ExecutionResult.builder()
                        .stdout(stdout)
                        .stderr(stderr)
                        .exitCode(exitCode)
                        .durationMs((int) duration)
                        .status(status)
                        .build();
            } else {
                return ExecutionResult.builder()
                        .stdout("")
                        .stderr("Judge0 API returned HTTP status: " + response.getStatusCode())
                        .exitCode(1)
                        .durationMs((int) duration)
                        .status(ExecutionResult.Status.ERROR)
                        .build();
            }

        } catch (IllegalArgumentException e) {
            long duration = System.currentTimeMillis() - startTime;
            log.warn("Judge0 execution rejected for invalid input: {}", e.getMessage());
            return ExecutionResult.builder()
                    .stdout("")
                    .stderr(e.getMessage())
                    .exitCode(400)
                    .durationMs((int) duration)
                    .status(ExecutionResult.Status.ERROR)
                    .build();
        } catch (HttpClientErrorException e) {
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = e.getStatusCode().value();
            log.error("Judge0 rejected submission: HTTP {} - {}. Body: {}", statusCode, e.getStatusText(), e.getResponseBodyAsString());

            if (statusCode == 401 || statusCode == 403) {
                return ExecutionResult.builder()
                        .stdout("")
                        .stderr("Judge0 service is unauthorized or subscription is inactive. Please verify the API key configuration.")
                        .exitCode(statusCode)
                        .durationMs((int) duration)
                        .status(ExecutionResult.Status.ERROR)
                        .build();
            } else if (statusCode == 400) {
                return ExecutionResult.builder()
                        .stdout("")
                        .stderr("Invalid request sent to Judge0.")
                        .exitCode(statusCode)
                        .durationMs((int) duration)
                        .status(ExecutionResult.Status.ERROR)
                        .build();
            } else if (statusCode == 429) {
                throw new ResourceAccessException("Judge0 rate limit exceeded (HTTP 429)");
            } else {
                return ExecutionResult.builder()
                        .stdout("")
                        .stderr("Judge0 client error: " + e.getStatusText())
                        .exitCode(statusCode)
                        .durationMs((int) duration)
                        .status(ExecutionResult.Status.ERROR)
                        .build();
            }
        } catch (HttpServerErrorException e) {
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = e.getStatusCode().value();
            log.error("Judge0 server error: HTTP {} - {}", statusCode, e.getStatusText());
            throw new ResourceAccessException("Judge0 server error (HTTP " + statusCode + ")");
        } catch (ResourceAccessException e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Judge0 API timeout/connection error after {} ms: {}", duration, e.getMessage());
            throw e;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Judge0 execution failed: {}", e.getMessage(), e);
            throw new RuntimeException("Judge0 Execution Failed: " + e.getMessage(), e);
        }
    }

    public ExecutionResult fallbackExecute(String language, String sourceCode, String stdin, Throwable throwable) {
        log.error("Judge0 Execution Circuit Breaker / Retry Fallback triggered due to: {}", throwable.getMessage());
        return ExecutionResult.builder()
                .stdout("")
                .stderr("[Circuit Breaker Fallback]: Code execution engine (Judge0 API) is currently experiencing rate limits or downtime. Cause: " + throwable.getMessage())
                .exitCode(503)
                .durationMs(0)
                .status(ExecutionResult.Status.ERROR)
                .build();
    }

    private int getJudge0LanguageId(String lang) {
        if (languageMapper != null) {
            return languageMapper.getLanguageId(lang);
        }
        if (lang == null) return 63; // JavaScript
        return switch (lang.trim().toLowerCase()) {
            case "js", "javascript" -> 63;
            case "py", "python" -> 71;
            case "java" -> 62;
            case "cpp", "c++" -> 54;
            case "c" -> 50;
            case "go" -> 60;
            case "rust" -> 73;
            case "ts", "typescript" -> 74;
            default -> 63;
        };
    }

    private String decodeJudge0Field(Object value) {
        if (value == null) {
            return "";
        }

        String encoded = value.toString();

        if (encoded.isEmpty()) {
            return "";
        }

        try {
            byte[] decoded = Base64.getDecoder().decode(encoded);
            return new String(decoded, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            log.warn("Judge0 returned non-Base64 output, using raw value");
            return encoded;
        }
    }
}
