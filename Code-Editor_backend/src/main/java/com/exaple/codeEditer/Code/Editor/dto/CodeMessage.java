package com.exaple.codeEditer.Code.Editor.dto;

import lombok.*;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Builder
public class CodeMessage {

    private String roomId;
    private String fileId;
    private String content;
    private String sender;
    private String language;
}
