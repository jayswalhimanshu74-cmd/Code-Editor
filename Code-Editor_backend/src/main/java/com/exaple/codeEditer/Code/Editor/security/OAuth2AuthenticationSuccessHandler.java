package com.exaple.codeEditer.Code.Editor.security;

import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
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

@Component
@RequiredArgsConstructor    
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${app.frontend.url:}")
    private String frontendUrl;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        User user = oAuth2User.getUser();

        if (user.getLastLogoutAt() != null) {
            user.setLastLogoutAt(null);
            userRepository.save(user);
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        String baseUrl = "http://localhost:5173";
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            baseUrl = frontendUrl.trim();
        } else if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            String firstOrigin = allowedOrigins.split(",")[0].trim();
            if (!firstOrigin.isBlank()) {
                baseUrl = firstOrigin;
            }
        }
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }

        boolean isHttps = baseUrl.startsWith("https://");
        String sameSite = isHttps ? "None" : "Lax";

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true).secure(isHttps).path("/").maxAge(900).sameSite(sameSite).build();
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true).secure(isHttps).path("/").maxAge(604800).sameSite(sameSite).build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        log.info("OAuth2 login successful for user: {}. Redirecting to: {}", user.getEmail(), baseUrl);

        String targetUrl = baseUrl + "/auth/success?token=" + accessToken + "&refreshToken=" + refreshToken;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
