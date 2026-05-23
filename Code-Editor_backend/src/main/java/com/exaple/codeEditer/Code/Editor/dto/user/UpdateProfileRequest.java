package com.exaple.codeEditer.Code.Editor.dto.user;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 2, max = 50, message = "Username must be 2-50 characters")
    private String username;

    private String avatarUrl;
}