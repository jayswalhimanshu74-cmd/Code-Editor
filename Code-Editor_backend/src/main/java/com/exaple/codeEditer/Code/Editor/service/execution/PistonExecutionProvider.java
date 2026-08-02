package com.exaple.codeEditer.Code.Editor.service.execution;

import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service("pistonExecutionProvider")
@Slf4j
public class PistonExecutionProvider implements ExecutionProvider {

    @Value("${execution.piston.url:http://localhost:20000/api/v2/piston/execute}")
    private String pistonUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Set<String> supportedRuntimes = ConcurrentHashMap.newKeySet();
    private static final int MAX_OUTPUT_SIZE = 100_000; // 100 KB max stdout/stderr

    @PostConstruct
    public void init() {
        log.info("Initializing PistonExecutionProvider with URL: {}", pistonUrl);
        verifyAndLoadRuntimes();
    }

    public synchronized void verifyAndLoadRuntimes() {
        try {
            String runtimesUrl = getRuntimesUrl();
            log.info("Verifying Piston execution engine health via: {}", runtimesUrl);

            ResponseEntity<List> response = restTemplate.getForEntity(runtimesUrl, List.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                supportedRuntimes.clear();
                for (Object item : response.getBody()) {
                    if (item instanceof Map<?, ?> map) {
                        Object lang = map.get("language");
                        if (lang != null) {
                            supportedRuntimes.add(lang.toString().toLowerCase());
                        }
                        Object aliases = map.get("aliases");
                        if (aliases instanceof List<?> aliasList) {
                            for (Object alias : aliasList) {
                                if (alias != null) {
                                    supportedRuntimes.add(alias.toString().toLowerCase());
                                }
                            }
                        }
                    }
                }
                log.info("Successfully connected to Piston engine. Loaded {} supported runtime aliases.", supportedRuntimes.size());
            } else {
                log.warn("Piston health check returned status: {}. Self-hosted engine might still be starting.", response.getStatusCode());
            }
        } catch (Exception e) {
            log.warn("Unable to reach Piston runtimes endpoint at startup: {}. Application will continue, retrying dynamically on execution requests.", e.getMessage());
        }
    }

    @Override
    @CircuitBreaker(name = "executionProvider", fallbackMethod = "fallbackExecute")
    @Retry(name = "executionProvider", fallbackMethod = "fallbackExecute")
    @Bulkhead(name = "executionProvider", fallbackMethod = "fallbackExecute")
    public ExecutionResult execute(String language, String sourceCode, String stdin) {
        log.info("Executing code via Piston API for language: {}", language);
        long startTime = System.currentTimeMillis();

        try {
            String pistonLang = mapLanguage(language);

            // Validate language if supported runtimes map is populated
            if (!supportedRuntimes.isEmpty() && !supportedRuntimes.contains(pistonLang)) {
                log.warn("Requested language '{}' mapped to '{}' is not in loaded supported runtimes list", language, pistonLang);
            }

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

            String executeEndpoint = getExecuteUrl();
            log.info("Sending execution request to Piston URL: {}", executeEndpoint);

            ResponseEntity<Map> response = restTemplate.exchange(executeEndpoint, HttpMethod.POST, entity, Map.class);
            long duration = System.currentTimeMillis() - startTime;

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                Map runObj = (Map) body.get("run");

                String stdout = runObj != null && runObj.get("stdout") != null ? runObj.get("stdout").toString() : "";
                String stderr = runObj != null && runObj.get("stderr") != null ? runObj.get("stderr").toString() : "";
                Integer exitCode = runObj != null && runObj.get("code") != null ? ((Number) runObj.get("code")).intValue() : 0;

                // Truncate huge output to prevent memory exhaustion
                stdout = truncateOutput(stdout);
                stderr = truncateOutput(stderr);

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
                .stderr("[Circuit Breaker Fallback]: Self-hosted Piston code execution engine is currently unavailable or initializing. Cause: " + throwable.getMessage())
                .exitCode(503)
                .durationMs(0)
                .status(ExecutionResult.Status.ERROR)
                .build();
    }

    private String getExecuteUrl() {
        if (pistonUrl == null || pistonUrl.isBlank()) {
            return "http://localhost:20000/api/v2/execute";
        }
        String cleanUrl = pistonUrl.trim();
        if (cleanUrl.endsWith("/piston/execute")) {
            return cleanUrl;
        }
        if (cleanUrl.endsWith("/execute")) {
            return cleanUrl;
        }
        if (cleanUrl.endsWith("/")) {
            cleanUrl = cleanUrl.substring(0, cleanUrl.length() - 1);
        }
        return cleanUrl + "/api/v2/execute";
    }

    private String getRuntimesUrl() {
        String execUrl = getExecuteUrl();
        if (execUrl.contains("/execute")) {
            return execUrl.replace("/execute", "/runtimes");
        }
        return execUrl + "/runtimes";
    }

    private String truncateOutput(String text) {
        if (text == null) return "";
        if (text.length() > MAX_OUTPUT_SIZE) {
            return text.substring(0, MAX_OUTPUT_SIZE) + "\n... [Output truncated after 100 KB]";
        }
        return text;
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
