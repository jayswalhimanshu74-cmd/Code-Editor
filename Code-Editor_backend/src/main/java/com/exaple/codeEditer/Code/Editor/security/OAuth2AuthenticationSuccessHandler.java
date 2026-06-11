package com.exaple.codeEditer.Code.Editor.security;

import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.exaple.codeEditer.Code.Editor.entity.AuthProvider;


import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;

import java.io.IOException;

@Component
@RequiredArgsConstructor    
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        User user = oAuth2User.getUser();

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true).secure(false).path("/").maxAge(900).sameSite("Lax").build();
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true).secure(false).path("/").maxAge(604800).sameSite("Lax").build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        log.info("OAuth2 login successful for user: {}", user.getEmail());

        // Redirect to the frontend callback page without tokens in the URL
        String targetUrl = "http://localhost:5173/auth/success";
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
