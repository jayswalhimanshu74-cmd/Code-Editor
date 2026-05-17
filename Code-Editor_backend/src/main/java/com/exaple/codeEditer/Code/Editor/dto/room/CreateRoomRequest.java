package com.exaple.codeEditer.Code.Editor.dto.room;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateRoomRequest {

    @NotBlank(message = "Room name is required")
    @Size(min = 2, max = 100, message = "Room name must be 2-100 characters")
    private String name;

    private String language = "javascript";
}