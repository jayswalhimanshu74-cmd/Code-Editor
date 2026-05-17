package com.exaple.codeEditer.Code.Editor.dto.file;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileResponse {

    private UUID id;
    private String name;
    private String content;
    private String language;
    private Boolean isFolder;
    private UUID parentId;
    private UUID roomId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<FileResponse> children;

}