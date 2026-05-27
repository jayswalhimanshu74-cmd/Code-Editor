package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.dto.ai.AiChatRequest;
import com.exaple.codeEditer.Code.Editor.dto.ai.AiChatResponse;
import com.exaple.codeEditer.Code.Editor.service.AiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.exaple.codeEditer.Code.Editor.service.RateLimitService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {

    private final AiService aiService;
    private final RateLimitService rateLimitService;


    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(
            @RequestBody AiChatRequest request, @AuthenticationPrincipal UserDetails userDetails) {

                 // ← ADD THIS
    if (userDetails != null && !rateLimitService.allowAiChat(userDetails.getUsername())) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .body(new AiChatResponse("Rate limit reached. Please wait a moment."));
    }
        log.info("AI chat request — language: {}", request.getLanguage());
        String reply = aiService.chat(request);
        return ResponseEntity.ok(new AiChatResponse(reply));
    }
}