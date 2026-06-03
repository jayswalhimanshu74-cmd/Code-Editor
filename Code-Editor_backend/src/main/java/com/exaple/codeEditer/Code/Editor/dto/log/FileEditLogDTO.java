package com.exaple.codeEditer.Code.Editor.dto.log;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class FileEditLogDTO {
    private UUID id;
    private String actionType;          // EDIT | CREATE | DELETE | RENAME
    private String fileName;
    private UUID fileId;
    private String username;
    private String userEmail;
    private String contentSnapshot;     // null for CREATE/DELETE/RENAME
    private LocalDateTime changedAt;
}