package com.exaple.codeEditer.Code.Editor.dto.ws;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeChangeEvent {

    private UUID fileId;
    private String content;
    private String senderEmail;
    private String username;
    private Long timestamp;
}