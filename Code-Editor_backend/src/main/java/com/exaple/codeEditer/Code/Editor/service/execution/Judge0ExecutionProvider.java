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

@Service("judge0ExecutionProvider")
@Slf4j
public class Judge0ExecutionProvider implements ExecutionProvider {

    @Value("${execution.judge0.url:https://judge0-ce.p.rapidapi.com/submissions?wait=true}")
    private String judge0Url;

    @Value("${execution.judge0.key:}")
    private String judge0Key;

    @Value("${execution.judge0.host:judge0-ce.p.rapidapi.com}")
    private String judge0Host;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @CircuitBreaker(name = "executionProvider", fallbackMethod = "fallbackExecute")
    @Retry(name = "executionProvider", fallbackMethod = "fallbackExecute")
    @Bulkhead(name = "executionProvider", fallbackMethod = "fallbackExecute")
    public ExecutionResult execute(String language, String sourceCode, String stdin) {
        log.info("Executing code via Judge0 API for language: {}", language);
        long startTime = System.currentTimeMillis();

        try {
            int languageId = getJudge0LanguageId(language);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("source_code", sourceCode);
            requestBody.put("language_id", languageId);
            requestBody.put("stdin", stdin != null ? stdin : "");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (judge0Key != null && !judge0Key.isBlank()) {
                headers.set("X-RapidAPI-Key", judge0Key);
                headers.set("X-RapidAPI-Host", judge0Host);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(judge0Url, HttpMethod.POST, entity, Map.class);
            long duration = System.currentTimeMillis() - startTime;

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                String stdout = body.get("stdout") != null ? body.get("stdout").toString() : "";
                String stderr = body.get("stderr") != null ? body.get("stderr").toString() : "";
                String compileOutput = body.get("compile_output") != null ? body.get("compile_output").toString() : "";

                if (!compileOutput.isEmpty()) {
                    stderr = stderr.isEmpty() ? compileOutput : stderr + "\n" + compileOutput;
                }

                Integer exitCode = body.get("exit_code") != null ? ((Number) body.get("exit_code")).intValue() : 0;
                
                Map statusObj = (Map) body.get("status");
                Integer statusId = statusObj != null && statusObj.get("id") != null ? ((Number) statusObj.get("id")).intValue() : 3;

                ExecutionResult.Status status = (statusId == 3 && exitCode == 0)
                        ? ExecutionResult.Status.SUCCESS
                        : (statusId == 5 ? ExecutionResult.Status.TIMEOUT : ExecutionResult.Status.FAILED);

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
}
