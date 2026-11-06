package com.exaple.codeEditer.Code.Editor.dto.ExecutionHistory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordExecutionRequest {
    private UUID fileId;
    private String language;
    private String sourceCode;
    private String stdout;
    private String stderr;
    private Integer exitCode;
    private Integer durationMs;
    private String status;
}
