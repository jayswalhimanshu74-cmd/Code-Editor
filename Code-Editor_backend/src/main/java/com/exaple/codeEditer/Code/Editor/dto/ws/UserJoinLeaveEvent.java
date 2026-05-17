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
public class UserJoinLeaveEvent {
    private UUID roomId;
    private String username;
    private String email;
    private String avatarUrl;
    private String type;      // "JOIN" or "LEAVE"
    private Long timestamp;
}