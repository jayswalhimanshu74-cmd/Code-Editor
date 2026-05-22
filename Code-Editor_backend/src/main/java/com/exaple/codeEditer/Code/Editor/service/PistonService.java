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
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class PistonService {

    @Value("${jdoodle.api.url}")
    private String apiUrl;

    @Value("${jdoodle.client.id}")
    private String clientId;

    @Value("${jdoodle.client.secret}")
    private String clientSecret;

    private final ExecutionHistoryRepository executionHistoryRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // JDoodle language + version index
    private static final Map<String, String[]> LANGUAGE_MAP = new HashMap<>();
    static {
        //                        language slug       versionIndex
        LANGUAGE_MAP.put("python",     new String[]{"python3",     "4"});
        LANGUAGE_MAP.put("javascript", new String[]{"nodejs",      "4"});
        LANGUAGE_MAP.put("java",       new String[]{"java",        "4"});
        LANGUAGE_MAP.put("cpp",        new String[]{"cpp17",       "1"});
        LANGUAGE_MAP.put("c",          new String[]{"c",           "5"});
        LANGUAGE_MAP.put("go",         new String[]{"go",          "4"});
        LANGUAGE_MAP.put("rust",       new String[]{"rust",        "4"});
        LANGUAGE_MAP.put("typescript", new String[]{"typescript",  "4"});
        LANGUAGE_MAP.put("kotlin",     new String[]{"kotlin",      "3"});
        LANGUAGE_MAP.put("csharp",     new String[]{"csharp",      "4"});
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

    public ExecuteResponse execute(UUID roomId, ExecuteRequest request, String email) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String[] langConfig = LANGUAGE_MAP.get(request.getLanguage().toLowerCase());
        if (langConfig == null) {
            throw new RuntimeException("Unsupported language: " + request.getLanguage());
        }

        long startTime = System.currentTimeMillis();

        try {
            ExecuteResponse response = callJDoodle(
                    request.getSourceCode(),
                    request.getStdin(),
                    langConfig[0],
                    langConfig[1]
            );

            long duration = System.currentTimeMillis() - startTime;
            saveHistory(room, user, request, response, (int) duration);

            return response;

        } catch (Exception e) {
            log.error("JDoodle execution failed: {}", e.getMessage());
            throw new RuntimeException("Code execution failed: " + e.getMessage());
        }
    }

    private ExecuteResponse callJDoodle(String sourceCode,
                                        String stdin,
                                        String language,
                                        String versionIndex) throws Exception {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("clientId",     clientId);
        body.put("clientSecret", clientSecret);
        body.put("script",       sourceCode);
        body.put("language",     language);
        body.put("versionIndex", versionIndex);
        body.put("stdin",        stdin != null ? stdin : "");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        log.info("Calling JDoodle for language: {}", language);

        ResponseEntity<String> response = restTemplate.postForEntity(
                apiUrl, entity, String.class
        );

        JsonNode node = objectMapper.readTree(response.getBody());

        String output    = getText(node, "output");
        int    exitCode  = node.has("statusCode")
                           ? node.get("statusCode").asInt() : 0;
        String memory    = getText(node, "memory");
        String cpuTime   = getText(node, "cpuTime");

        // JDoodle returns everything in "output" — split stdout/stderr best effort
        String stdout = null;
        String stderr = null;

        if (output != null) {
            // JDoodle prefixes runtime errors with "JDoodle" or contains exception text
            if (exitCode != 200 || output.contains("Exception") 
                    || output.contains("Error") || output.contains("error")) {
                stderr = output;
            } else {
                stdout = output;
            }
        }

        // statusCode 200 = success in JDoodle
        String status;
        if (exitCode == 200) {
            status = "Accepted";
        } else {
            status = "Runtime Error";
        }

        return ExecuteResponse.builder()
                .stdout(stdout)
                .stderr(stderr)
                .compileOutput(null)
                .status(status)
                .exitCode(exitCode == 200 ? 0 : 1)
                .time(cpuTime)
                .memory(memory)
                .build();
    }

    private void saveHistory(Room room, User user, ExecuteRequest request,
                             ExecuteResponse response, int durationMs) {
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