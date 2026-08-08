package com.exaple.codeEditer.Code.Editor.dto.execution;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteRequest {

    @NotBlank(message = "Source code is required")
    @Size(max = 65536, message = "Source code exceeds maximum size limit of 64 KB")
    private String sourceCode;

    @NotBlank(message = "Language is required")
    private String language;

    @Builder.Default
    private String stdin = "";

    private String versionIndex;
}
