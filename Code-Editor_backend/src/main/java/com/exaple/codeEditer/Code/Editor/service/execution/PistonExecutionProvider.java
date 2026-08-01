package com.exaple.codeEditer.Code.Editor.service.execution;

import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service("pistonExecutionProvider")
@Slf4j
public class PistonExecutionProvider implements ExecutionProvider {

    @Value("${execution.piston.url:https://emkc.org/api/v2/piston/execute}")
    private String pistonUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @CircuitBreaker(name = "executionProvider", fallbackMethod = "fallbackExecute")
    @Retry(name = "executionProvider", fallbackMethod = "fallbackExecute")
    @Bulkhead(name = "executionProvider", fallbackMethod = "fallbackExecute")
    public ExecutionResult execute(String language, String sourceCode, String stdin) {
        log.info("Executing code via Piston API for language: {}", language);
        long startTime = System.currentTimeMillis();

        try {
            String pistonLang = mapLanguage(language);

            Map<String, Object> fileObj = new HashMap<>();
            fileObj.put("content", sourceCode);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("language", pistonLang);
            requestBody.put("version", "*");
            requestBody.put("files", List.of(fileObj));
            requestBody.put("stdin", stdin != null ? stdin : "");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(pistonUrl, HttpMethod.POST, entity, Map.class);
            long duration = System.currentTimeMillis() - startTime;

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                Map runObj = (Map) body.get("run");

                String stdout = runObj != null && runObj.get("stdout") != null ? runObj.get("stdout").toString() : "";
                String stderr = runObj != null && runObj.get("stderr") != null ? runObj.get("stderr").toString() : "";
                Integer exitCode = runObj != null && runObj.get("code") != null ? ((Number) runObj.get("code")).intValue() : 0;

                ExecutionResult.Status status = (exitCode == 0 && stderr.isEmpty()) 
                        ? ExecutionResult.Status.SUCCESS 
                        : ExecutionResult.Status.FAILED;

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
                        .stderr("Piston execution API returned status code: " + response.getStatusCode())
                        .exitCode(1)
                        .durationMs((int) duration)
                        .status(ExecutionResult.Status.ERROR)
                        .build();
            }

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Piston execution failed: {}", e.getMessage(), e);
            throw new RuntimeException("Piston Execution Failed: " + e.getMessage(), e);
        }
    }

    public ExecutionResult fallbackExecute(String language, String sourceCode, String stdin, Throwable throwable) {
        log.error("Piston Execution Circuit Breaker / Retry Fallback triggered due to: {}", throwable.getMessage());
        return ExecutionResult.builder()
                .stdout("")
                .stderr("[Circuit Breaker Fallback]: Code execution engine (Piston API) is currently experiencing rate limits or downtime. Cause: " + throwable.getMessage())
                .exitCode(503)
                .durationMs(0)
                .status(ExecutionResult.Status.ERROR)
                .build();
    }

    private String mapLanguage(String lang) {
        if (lang == null) return "javascript";
        String normalized = lang.trim().toLowerCase();
        return switch (normalized) {
            case "js", "javascript" -> "javascript";
            case "ts", "typescript" -> "typescript";
            case "py", "python" -> "python";
            case "java" -> "java";
            case "cpp", "c++" -> "cpp";
            case "c" -> "c";
            case "go" -> "go";
            case "rust" -> "rust";
            default -> normalized;
        };
    }
}
