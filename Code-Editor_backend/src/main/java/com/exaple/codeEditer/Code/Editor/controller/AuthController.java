package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.dto.AuthResponse;
import com.exaple.codeEditer.Code.Editor.dto.LoginRequest;
import com.exaple.codeEditer.Code.Editor.dto.RefreshTokenRequest;
import com.exaple.codeEditer.Code.Editor.dto.RegisterRequest;
import com.exaple.codeEditer.Code.Editor.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;
import java.util.Map;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final com.exaple.codeEditer.Code.Editor.service.RateLimitService rateLimitService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        if (!rateLimitService.allowRegister(ip)) {
            return ResponseEntity.status(429).header("Retry-After", "60").body(Map.of("message", "Too many registration attempts. Try again later."));
        }
        AuthResponse response = authService.register(request);
        return buildCookieResponse(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        if (!rateLimitService.allowLogin(ip)) {
            return ResponseEntity.status(429).header("Retry-After", "60").body(Map.of("message", "Too many login attempts. Try again later."));
        }
        AuthResponse response = authService.login(request);
        return buildCookieResponse(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null) {
            return ResponseEntity.status(401).build();
        }
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken(refreshToken);
        AuthResponse response = authService.refresh(request);
        return buildCookieResponse(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            authService.logout(userDetails.getUsername());
        }
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true).secure(true).path("/").maxAge(0).sameSite("None").build();
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true).secure(true).path("/").maxAge(0).sameSite("None").build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .build();
    }

    private ResponseEntity<AuthResponse> buildCookieResponse(AuthResponse authResponse) {
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", authResponse.getAccessToken())
                .httpOnly(true).secure(true).path("/").maxAge(900).sameSite("None").build(); // 15 mins
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", authResponse.getRefreshToken())
                .httpOnly(true).secure(true).path("/").maxAge(604800).sameSite("None").build(); // 7 days

        // Remove tokens from JSON body
        authResponse.setAccessToken(null);
        authResponse.setRefreshToken(null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(authResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> getMe(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.getMe(userDetails.getUsername()));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> requestBody, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        if (!rateLimitService.allowPasswordReset(ip)) {
            return ResponseEntity.status(429).header("Retry-After", "900").body(Map.of("message", "Too many password reset attempts. Try again in 15 minutes."));
        }
        String email = requestBody.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        try {
            String token = authService.forgotPassword(email);
            return ResponseEntity.ok(Map.of("message", "Reset link sent to email (check backend console for token)!", "token", token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> requestBody, HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        if (!rateLimitService.allowPasswordReset(ip)) {
            return ResponseEntity.status(429).header("Retry-After", "900").body(Map.of("message", "Too many password reset attempts. Try again in 15 minutes."));
        }
        String token = requestBody.get("token");
        String newPassword = requestBody.get("newPassword");
        if (token == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token and new password are required"));
        }
        try {
            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

}
