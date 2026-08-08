package com.exaple.codeEditer.Code.Editor.dto.judge0;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Judge0SubmissionRequest {

    @JsonProperty("source_code")
    @NotNull(message = "Source code is required")
    private String sourceCode;

    @JsonProperty("language_id")
    @NotNull(message = "Language ID is required")
    private Integer languageId;

    @JsonProperty("stdin")
    private String stdin;

    @JsonProperty("compiler_options")
    private String compilerOptions;

    @JsonProperty("command_line_arguments")
    private String commandLineArguments;

    @JsonProperty("cpu_time_limit")
    private Double cpuTimeLimit;

    @JsonProperty("memory_limit")
    private Integer memoryLimit; // In KB

    @JsonProperty("redirect_stderr_to_stdout")
    private Boolean redirectStderrToStdout;

    @JsonProperty("expected_output")
    private String expectedOutput;
}
