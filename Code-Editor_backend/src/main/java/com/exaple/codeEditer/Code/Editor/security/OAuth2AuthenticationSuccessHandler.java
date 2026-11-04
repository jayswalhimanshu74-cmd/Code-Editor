package com.exaple.codeEditer.Code.Editor.security;

import com.exaple.codeEditer.Code.Editor.entity.RefreshToken;
import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.RefreshTokenRepository;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import com.exaple.codeEditer.Code.Editor.service.AuditLogService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuditLogService auditLogService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        User user = oAuth2User.getUser();

        // Clear last-logout timestamp so existing JWTs aren't pre-invalidated
        if (user.getLastLogoutAt() != null) {
            user.setLastLogoutAt(null);
            userRepository.save(user);
        }

        // Generate tokens using the existing JWT mechanism
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        // Persist refresh token to database (fixes broken refresh for OAuth users)
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        // Resolve the validated frontend base URL
        String baseUrl = resolveBaseUrl();
        boolean isHttps = baseUrl.startsWith("https://");
        String sameSite = isHttps ? "None" : "Lax";

        // Set secure HttpOnly cookies (same pattern as AuthController)
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true).secure(isHttps).path("/").maxAge(900).sameSite(sameSite).build();
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true).secure(isHttps).path("/").maxAge(604800).sameSite(sameSite).build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        auditLogService.log("OAUTH2_LOGIN", "USER", user.getEmail(), "OAuth2 login successful");
        log.info("OAuth2 login successful for user: {}. Redirecting to frontend.", user.getEmail());

        // Redirect to frontend — NEVER expose tokens in URL
        String targetUrl = baseUrl + "/oauth2/success";
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    /**
     * Resolves and validates the frontend base URL.
     * Only uses the configured FRONTEND_URL — never accepts arbitrary redirect targets.
     */
    private String resolveBaseUrl() {
        String baseUrl = "http://localhost:5173";
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            baseUrl = frontendUrl.trim();
        }
        // Strip trailing slash
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl;
    }
}
