package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.dto.AuthResponse;
import com.exaple.codeEditer.Code.Editor.dto.LoginRequest;
import com.exaple.codeEditer.Code.Editor.dto.RefreshTokenRequest;
import com.exaple.codeEditer.Code.Editor.dto.RegisterRequest;
import com.exaple.codeEditer.Code.Editor.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout( @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        authService.logout(userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> getMe(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getMe(userDetails.getUsername()));
    }

}
