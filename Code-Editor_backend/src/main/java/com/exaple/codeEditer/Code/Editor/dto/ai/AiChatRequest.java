package com.exaple.codeEditer.Code.Editor.dto.ai;

import lombok.Data;

import java.util.List;

@Data
public class AiChatRequest {

    private List<Message> messages;
    private String code;
    private String language;

    @Data
    public static class Message {
        private String role;    // "user" or "assistant"
        private String content;
    }
}