package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.entity.ChatMessage;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.repository.ChatMessageRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomMemberRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{roomId}/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        var user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!roomMemberRepository.existsByRoomAndUser(room, user)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                chatMessageRepository.findRecentByRoom(room)
        );
    }
}