package com.exaple.codeEditer.Code.Editor.dto.file;



import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateFileRequest {

    @NotBlank(message = "File name is required")
    private String name;

    private String content = "";
    private String language = "plaintext";
    private String parentId = null;
    private Boolean isFolder = false;
}