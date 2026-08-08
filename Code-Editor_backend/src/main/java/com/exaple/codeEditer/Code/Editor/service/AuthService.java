package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.dto.AuthResponse;
import com.exaple.codeEditer.Code.Editor.dto.LoginRequest;
import com.exaple.codeEditer.Code.Editor.dto.RefreshTokenRequest;
import com.exaple.codeEditer.Code.Editor.dto.RegisterRequest;
import com.exaple.codeEditer.Code.Editor.entity.RefreshToken;
import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.RefreshTokenRepository;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import com.exaple.codeEditer.Code.Editor.security.JwtService;
import com.exaple.codeEditer.Code.Editor.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditLogService auditLogService;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            auditLogService.log("USER_REGISTER_FAILED", "USER", request.getEmail(), "Registration attempt failed: email already in use");
            throw new RuntimeException("Email already in use");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            auditLogService.log("USER_REGISTER_FAILED", "USER", request.getUsername(), "Registration attempt failed: username already taken");
            throw new RuntimeException("Username already taken");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        auditLogService.log("USER_REGISTER", "USER", user.getEmail(), "Registration successful");

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new BadCredentialsException("Invalid email or password");
            }

            // revoke old tokens before issuing new ones
            refreshTokenRepository.revokeAllUserTokens(user);

            AuthResponse response = buildAuthResponse(user);
            auditLogService.log("USER_LOGIN", "USER", user.getEmail(), "Login successful");
            return response;
        } catch (BadCredentialsException e) {
            auditLogService.log("USER_LOGIN_FAILED", "USER", request.getEmail(), "Failed login attempt (bad credentials)");
            throw e;
        }
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {

        if (request == null || request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            throw new UnauthorizedException("Refresh token is required");
        }

        RefreshToken stored = refreshTokenRepository
                .findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (stored.getRevoked()) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }
        if (stored.getExpiresAt() != null && stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token expired");
        }
        if (!jwtService.isTokenValid(request.getRefreshToken()) || 
            !"refresh".equals(jwtService.extractTokenType(request.getRefreshToken()))) {
            throw new UnauthorizedException("Refresh token invalid");
        }

        User user = stored.getUser();
        if (user == null) {
            throw new UnauthorizedException("User not found for refresh token");
        }

        // rotate — revoke old, issue new
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("User Not Found "));

        // Set last logout time to invalidate all existing access tokens
        user.setLastLogoutAt(LocalDateTime.now());
        userRepository.save(user);

        // Revoke all refresh tokens
        refreshTokenRepository.deleteByUser(user);
        auditLogService.log("USER_LOGOUT", "USER", email, "Logout successful");
    }


    @Transactional(readOnly = true)
    public AuthResponse.UserDto getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toUserDto(user);
    }

    @Transactional
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtService.generatePasswordResetToken(user.getEmail());
        
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }

        auditLogService.log("PASSWORD_RESET_REQUEST", "USER", email, "Password reset requested");

        System.out.println("=================================================");
        System.out.println("PASSWORD RESET TOKEN FOR " + email + ": " + token);
        System.out.println("=================================================");
        return token;
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (!jwtService.isTokenValid(token) || 
            !"reset".equals(jwtService.extractTokenType(token))) {
            auditLogService.log("PASSWORD_RESET_FAILED", "TOKEN", token, "Password reset failed (invalid or expired token)");
            throw new RuntimeException("Invalid or expired reset token");
        }
        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        refreshTokenRepository.revokeAllUserTokens(user);
        auditLogService.log("PASSWORD_RESET_SUCCESS", "USER", email, "Password reset successful");
    }


    private AuthResponse buildAuthResponse(User user) {
        if (user.getLastLogoutAt() != null) {
            user.setLastLogoutAt(null);
            userRepository.save(user);
        }

        String accessToken  = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        saveRefreshToken(user, refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(toUserDto(user))
                .build();
    }

    private void saveRefreshToken(User user, String token) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);
    }

    private AuthResponse.UserDto toUserDto(User user) {
        return AuthResponse.UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .build();
    }
}