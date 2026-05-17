package com.exaple.codeEditer.Code.Editor.dto.file;


import lombok.Data;

@Data
public class UpdateFileRequest {
    private String name;
    private String content;
    private String language;
}