package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.security.JwtService;
import com.exaple.codeEditer.Code.Editor.repository.RoomMemberRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ForwardAuthController {

    private final JwtService jwtService;
    private final RoomMemberRepository roomMemberRepository;

    @GetMapping("/api/auth/forward")
    public ResponseEntity<Void> forwardAuth(HttpServletRequest request) {
        // Traefik passes original request headers
        String originalHost = request.getHeader("X-Forwarded-Host");
        if (originalHost == null) {
            log.warn("ForwardAuth attempt missing X-Forwarded-Host header");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Subdomain is in format: {port}-{roomId}.ide.localhost
        String[] parts = originalHost.split("\\.");
        if (parts.length < 2) {
            log.warn("ForwardAuth attempt with invalid host: {}", originalHost);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        String subdomain = parts[0];
        int dashIdx = subdomain.indexOf('-');
        if (dashIdx == -1) {
            log.warn("ForwardAuth attempt with invalid subdomain layout: {}", subdomain);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        String roomIdStr = subdomain.substring(dashIdx + 1);
        UUID roomId;
        try {
            roomId = UUID.fromString(roomIdStr);
        } catch (IllegalArgumentException e) {
            log.warn("ForwardAuth attempt with invalid Room UUID: {}", roomIdStr);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        // Extract accessToken from cookie or Authorization header
        String token = extractToken(request);
        if (token == null || !jwtService.isTokenValid(token)) {
            log.warn("ForwardAuth token missing or invalid");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = jwtService.extractEmail(token);
        if (!roomMemberRepository.existsByRoomIdAndUserEmail(roomId, email)) {
            log.warn("ForwardAuth unauthorized for user {} and room {}", email, roomId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("ForwardAuth access GRANTED to user {} for room {}", email, roomId);
        return ResponseEntity.ok().build();
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
