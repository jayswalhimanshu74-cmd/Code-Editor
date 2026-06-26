package com.exaple.codeEditer.Code.Editor.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuntimeDefinition {
    private String id;
    private String name;
    private String language;
    private String imageTag;
    private String versionQueryCommand;
    private String expectedVersionRegex;
}
