package com.exaple.codeEditer.Code.Editor.dto.ws;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatEvent {
    private UUID roomId;
    private String senderEmail;
    private String username;
    private String avatarUrl;
    private String content;
    private Long timestamp;
}