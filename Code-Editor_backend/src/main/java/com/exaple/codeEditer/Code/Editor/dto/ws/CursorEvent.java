package com.exaple.codeEditer.Code.Editor.dto.ws;

import lombok.Data;

@Data
public class CursorEvent {
    private String userId;
    private String username;
    private String email;
    private String color;       // assigned on frontend per user
    private int line;           // 1-based
    private int column;         // 1-based
    private long timestamp;
}