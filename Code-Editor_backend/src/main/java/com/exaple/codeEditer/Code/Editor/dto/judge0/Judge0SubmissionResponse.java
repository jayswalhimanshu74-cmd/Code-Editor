package com.exaple.codeEditer.Code.Editor.dto.judge0;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Judge0SubmissionResponse {

    @JsonProperty("stdout")
    private String stdout;

    @JsonProperty("stderr")
    private String stderr;

    @JsonProperty("compile_output")
    private String compileOutput;

    @JsonProperty("message")
    private String message;

    @JsonProperty("exit_code")
    private Integer exitCode;

    @JsonProperty("exit_signal")
    private Integer exitSignal;

    @JsonProperty("status")
    private Status status;

    @JsonProperty("time")
    private String time; // In seconds (e.g. "0.012")

    @JsonProperty("memory")
    private Integer memory; // In KB

    @JsonProperty("token")
    private String token;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("finished_at")
    private String finishedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Status {
        @JsonProperty("id")
        private Integer id;

        @JsonProperty("description")
        private String description;
    }
}
