package com.exaple.codeEditer.Code.Editor.dto.room;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinRoomRequest {

    @NotBlank(message = "Invite code is required")
    private String inviteCode;
}