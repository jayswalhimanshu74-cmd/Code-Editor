package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.dto.ai.AiChatRequest;
import com.exaple.codeEditer.Code.Editor.dto.ai.AiChatResponse;
import com.exaple.codeEditer.Code.Editor.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(
            @RequestBody AiChatRequest request) {

        log.info("AI chat request — language: {}", request.getLanguage());
        String reply = aiService.chat(request);
        return ResponseEntity.ok(new AiChatResponse(reply));
    }
}