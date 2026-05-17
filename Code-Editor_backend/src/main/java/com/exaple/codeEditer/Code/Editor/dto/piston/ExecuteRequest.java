package com.exaple.codeEditer.Code.Editor.dto.piston;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExecuteRequest {

    @NotBlank(message = "Source code is required")
    private String sourceCode;

    @NotBlank(message = "Language is required")
    private String language;

    private String stdin = "";
}