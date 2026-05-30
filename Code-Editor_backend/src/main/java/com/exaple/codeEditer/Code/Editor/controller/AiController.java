package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.dto.ai.AiChatRequest;
import com.exaple.codeEditer.Code.Editor.dto.ai.AiChatResponse;
import com.exaple.codeEditer.Code.Editor.repository.RoomMemberRepository;
import com.exaple.codeEditer.Code.Editor.service.AiService;
import com.exaple.codeEditer.Code.Editor.service.RateLimitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {

    private final AiService aiService;
    private final RateLimitService rateLimitService;
    private final RoomMemberRepository roomMemberRepository;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(
            @RequestBody AiChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Rate limit check
        if (!rateLimitService.allowAiChat(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new AiChatResponse("Rate limit reached. Please wait a moment."));
        }

        // Room membership guard
        if (request.getRoomId() != null) {
            try {
                UUID roomId = UUID.fromString(request.getRoomId());
                boolean isMember = roomMemberRepository
                        .existsByRoomIdAndUserEmail(roomId, userDetails.getUsername());
                if (!isMember) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(new AiChatResponse("You are not a member of this room."));
                }
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(new AiChatResponse("Invalid room ID."));
            }
        }

        log.info("AI chat — user: {}, room: {}, language: {}",
                userDetails.getUsername(), request.getRoomId(), request.getLanguage());

        String reply = aiService.chat(request);
        return ResponseEntity.ok(new AiChatResponse(reply));
    }
}