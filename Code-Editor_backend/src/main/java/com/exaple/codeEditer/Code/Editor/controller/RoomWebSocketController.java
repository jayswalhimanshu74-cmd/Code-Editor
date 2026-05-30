package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.dto.ws.ChatEvent;
import com.exaple.codeEditer.Code.Editor.dto.ws.CodeChangeEvent;
import com.exaple.codeEditer.Code.Editor.dto.ws.CursorEvent;
import com.exaple.codeEditer.Code.Editor.dto.ws.UserJoinLeaveEvent;
import com.exaple.codeEditer.Code.Editor.entity.ChatMessage;
import com.exaple.codeEditer.Code.Editor.repository.ChatMessageRepository;
import com.exaple.codeEditer.Code.Editor.repository.FileRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class RoomWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final FileRepository fileRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;

    // ── Code change ───────────────────────────────────────
    // Client sends to  : /app/room/{roomId}/code
    // Server pushes to : /topic/room/{roomId}/code
    @MessageMapping("/room/{roomId}/code")
    public void handleCodeChange(
            @DestinationVariable String roomId,
            @Payload CodeChangeEvent event) {

        // autosave content to DB
        if (event.getFileId() != null) {
            fileRepository.findById(event.getFileId()).ifPresent(file -> {
                file.setContent(event.getContent());
                fileRepository.save(file);
            });
        }

        event.setTimestamp(System.currentTimeMillis());

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/code", event
        );

        log.debug("Code change in room {} by {}", roomId, event.getSenderEmail());
    }

    // ── Chat message ──────────────────────────────────────
    // Client sends to  : /app/room/{roomId}/chat
    // Server pushes to : /topic/room/{roomId}/chat
    @MessageMapping("/room/{roomId}/chat")
    public void handleChat(
            @DestinationVariable String roomId,
            @Payload ChatEvent event) {

        // persist message to DB
        userRepository.findByEmail(event.getSenderEmail()).ifPresent(user -> {
            roomRepository.findById(UUID.fromString(roomId)).ifPresent(room -> {
                ChatMessage message = ChatMessage.builder()
                        .room(room)
                        .sender(user)
                        .content(event.getContent())
                        .build();
                chatMessageRepository.save(message);
            });
        });

        event.setTimestamp(System.currentTimeMillis());

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/chat", event
        );

        log.debug("Chat in room {} by {}", roomId, event.getSenderEmail());
    }

    // ── User join ─────────────────────────────────────────
    // Client sends to  : /app/room/{roomId}/join
    // Server pushes to : /topic/room/{roomId}/presence
    @MessageMapping("/room/{roomId}/join")
    public void handleUserJoin(
            @DestinationVariable String roomId,
            @Payload UserJoinLeaveEvent event) {

        event.setType("JOIN");
        event.setTimestamp(System.currentTimeMillis());

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/presence", event
        );

        log.info("User {} joined room {}", event.getUsername(), roomId);
    }

    // ── User leave ────────────────────────────────────────
    // Client sends to  : /app/room/{roomId}/leave
    // Server pushes to : /topic/room/{roomId}/presence
    @MessageMapping("/room/{roomId}/leave")
    public void handleUserLeave(
            @DestinationVariable String roomId,
            @Payload UserJoinLeaveEvent event) {

        event.setType("LEAVE");
        event.setTimestamp(System.currentTimeMillis());

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/presence", event
        );

        log.info("User {} left room {}", event.getUsername(), roomId);
    }
    @MessageMapping("/room/{roomId}/cursor")
    public void handleCursor(
            @DestinationVariable String roomId,
            @Payload CursorEvent event) {

        event.setTimestamp(System.currentTimeMillis());

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/cursors", event
    );
}
}