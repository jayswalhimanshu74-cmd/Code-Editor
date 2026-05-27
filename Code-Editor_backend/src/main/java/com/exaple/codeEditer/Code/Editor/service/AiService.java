package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.dto.ai.AiChatRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import com.exaple.codeEditer.Code.Editor.config.RestTemplateConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

     
    private final RestTemplate restTemplate ;
    private final ObjectMapper objectMapper;

  public String chat(AiChatRequest request) {
    
    
    try {
        
        String prompt = buildPrompt(request);

        Map<String, Object> body = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            ),
            "generationConfig", Map.of(
                "temperature", 0.7,
                "maxOutputTokens", 1024
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String url = geminiApiUrl + "?key=" + geminiApiKey;
 
        ResponseEntity<String> response = restTemplate.postForEntity(
            url,
            new HttpEntity<>(body, headers),
            String.class
        );

        log.info("Gemini response: {}", response.getBody()); // ✅ log response
        
        JsonNode node = objectMapper.readTree(response.getBody());

        return node
            .path("candidates").get(0)
            .path("content")
            .path("parts").get(0)
            .path("text")
            .asText("Sorry, I could not generate a response.");

    } catch (Exception e) {
        log.error("Gemini API full error: {}", e.getMessage(), e); // ✅ full stack
        throw new RuntimeException("AI service error: " + e.getMessage());
    }
}
    private String buildPrompt(AiChatRequest request) {
        StringBuilder prompt = new StringBuilder();

        // System instruction
        prompt.append("You are an expert coding assistant inside a collaborative code editor. ")
              .append("The user is working with ")
              .append(request.getLanguage() != null ? request.getLanguage() : "code")
              .append(".\n\n");

        // Attach current code as context
        if (request.getCode() != null && !request.getCode().isBlank()) {
            prompt.append("Current code in editor:\n```")
                  .append(request.getLanguage() != null ? request.getLanguage() : "")
                  .append("\n")
                  .append(request.getCode())
                  .append("\n```\n\n");
        }

        // Conversation history
        if (request.getMessages() != null) {
            for (AiChatRequest.Message msg : request.getMessages()) {
                if ("user".equals(msg.getRole())) {
                    prompt.append("User: ").append(msg.getContent()).append("\n");
                } else {
                    prompt.append("Assistant: ").append(msg.getContent()).append("\n");
                }
            }
        }

        prompt.append("Assistant:");
        return prompt.toString();
    }
}