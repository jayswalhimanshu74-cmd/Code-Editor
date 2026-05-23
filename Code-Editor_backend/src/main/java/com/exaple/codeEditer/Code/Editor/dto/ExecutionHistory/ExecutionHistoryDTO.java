package com.exaple.codeEditer.Code.Editor.dto.ExecutionHistory;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ExecutionHistoryDTO {
    private UUID id;
    private String language;
    private String sourceCode;
    private String stdout;
    private String stderr;
    private Integer exitCode;
    private Integer durationMs;
    private LocalDateTime executedAt;
    private String status;

    // Only safe fields from User
    
    private String runByUsername;
    private String runByEmail;

    // Only safe fields from Room
    private UUID roomId;
    private String roomName;
}