package com.exaple.codeEditer.Code.Editor.service;


import com.exaple.codeEditer.Code.Editor.dto.piston.ExecuteRequest;
import com.exaple.codeEditer.Code.Editor.dto.piston.ExecuteResponse;
import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.ExecutionHistoryRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class PistonService {

    @Value("${piston.api.url}")
    private String apiUrl;

    private final ExecutionHistoryRepository executionHistoryRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final Map<String, String[]> LANGUAGE_MAP = new HashMap<>();
    static {
        LANGUAGE_MAP.put("python",     new String[]{"python",     "3.10.0"});
        LANGUAGE_MAP.put("javascript", new String[]{"javascript", "18.15.0"});
        LANGUAGE_MAP.put("java",       new String[]{"java",       "15.0.2"});
        LANGUAGE_MAP.put("cpp",        new String[]{"c++",        "10.2.0"});
        LANGUAGE_MAP.put("c",          new String[]{"c",          "10.2.0"});
        LANGUAGE_MAP.put("go",         new String[]{"go",         "1.16.2"});
        LANGUAGE_MAP.put("rust",       new String[]{"rust",       "1.50.0"});
        LANGUAGE_MAP.put("typescript", new String[]{"typescript", "5.0.3"});
        LANGUAGE_MAP.put("kotlin",     new String[]{"kotlin",     "1.8.20"});
        LANGUAGE_MAP.put("csharp",     new String[]{"csharp",     "6.12.0"});
    }

    public PistonService(ExecutionHistoryRepository executionHistoryRepository,
                         RoomRepository roomRepository,
                         UserRepository userRepository,
                         ObjectMapper objectMapper) {
        this.executionHistoryRepository = executionHistoryRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    public ExecuteResponse execute(UUID roomId,
                                   ExecuteRequest request,
                                   String email) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String[] runtime = LANGUAGE_MAP.get(request.getLanguage().toLowerCase());
        if (runtime == null) {
            throw new RuntimeException(
                    "Unsupported language: " + request.getLanguage()
            );
        }

        long startTime = System.currentTimeMillis();

        try {
            ExecuteResponse response = callPiston(
                    request.getSourceCode(),
                    request.getLanguage(),
                    runtime[0],
                    runtime[1],
                    request.getStdin()
            );

            long duration = System.currentTimeMillis() - startTime;
            saveHistory(room, user, request, response, (int) duration);

            return response;

        } catch (Exception e) {
            log.error("Piston execution failed: {}", e.getMessage());
            throw new RuntimeException("Code execution failed: " + e.getMessage());
        }
    }

    private ExecuteResponse callPiston(String sourceCode,
                                       String language,
                                       String runtime,
                                       String version,
                                       String stdin) throws Exception {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> file = new HashMap<>();
        file.put("name", getFileName(language));
        file.put("content", sourceCode);

        Map<String, Object> body = new HashMap<>();
        body.put("language", runtime);
        body.put("version", version);
        body.put("files", List.of(file));
        body.put("stdin", stdin != null ? stdin : "");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                apiUrl + "/execute",
                entity,
                String.class
        );

        JsonNode node   = objectMapper.readTree(response.getBody());
        JsonNode run    = node.get("run");

        String  stdout  = getText(run, "stdout");
        String  stderr  = getText(run, "stderr");
        int     code    = run.has("code") ? run.get("code").asInt() : 0;

        String status;
        if (code == 0 && (stderr == null || stderr.isBlank())) {
            status = "Accepted";
        } else if (code != 0) {
            status = "Runtime Error";
        } else {
            status = "Completed";
        }

        return ExecuteResponse.builder()
                .stdout(stdout)
                .stderr(stderr)
                .compileOutput(null)
                .status(status)
                .exitCode(code)
                .time(null)
                .memory(null)
                .build();
    }

    private String getFileName(String language) {
        return switch (language.toLowerCase()) {
            case "python"     -> "main.py";
            case "javascript" -> "main.js";
            case "typescript" -> "main.ts";
            case "java"       -> "Main.java";
            case "cpp"        -> "main.cpp";
            case "c"          -> "main.c";
            case "go"         -> "main.go";
            case "rust"       -> "main.rs";
            case "kotlin"     -> "main.kt";
            case "csharp"     -> "main.cs";
            default           -> "main.txt";
        };
    }

    private void saveHistory(Room room,
                             User user,
                             ExecuteRequest request,
                             ExecuteResponse response,
                             int durationMs) {
        ExecutionHistory history = ExecutionHistory.builder()
                .room(room)
                .runBy(user)
                .language(request.getLanguage())
                .sourceCode(request.getSourceCode())
                .stdout(response.getStdout())
                .stderr(response.getStderr())
                .exitCode(response.getExitCode())
                .durationMs(durationMs)
                .build();

        executionHistoryRepository.save(history);
    }

    private String getText(JsonNode node, String field) {
        return node.has(field) && !node.get(field).isNull()
                ? node.get(field).asText() : null;
    }
}