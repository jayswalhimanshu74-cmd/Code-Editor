package com.exaple.codeEditer.Code.Editor.dto.user;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserProfileResponse {
    private UUID id;
    private String username;
    private String email;
    private String avatarUrl;
    private LocalDateTime createdAt;
}