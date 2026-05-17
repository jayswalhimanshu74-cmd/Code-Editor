package com.exaple.codeEditer.Code.Editor.dto.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private UUID id;
    private String name;
    private String inviteCode;
    private String language;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private OwnerDto owner;
    private List<MemberDto> members;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerDto {
        private UUID id;
        private String username;
        private String avatarUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberDto {
        private UUID id;
        private String username;
        private String avatarUrl;
        private String role;
        private LocalDateTime joinedAt;
    }
}