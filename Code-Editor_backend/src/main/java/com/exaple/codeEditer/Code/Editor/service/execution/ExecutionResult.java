package com.exaple.codeEditer.Code.Editor.service.execution;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionResult {
    private String stdout;
    private String stderr;
    private Integer exitCode;
    private Integer durationMs;
    private Status status;

    public enum Status {
        SUCCESS,
        FAILED,
        TIMEOUT,
        ERROR
    }
}
