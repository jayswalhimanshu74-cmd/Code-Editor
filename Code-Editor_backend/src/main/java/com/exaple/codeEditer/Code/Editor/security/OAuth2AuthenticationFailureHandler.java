package com.exaple.codeEditer.Code.Editor.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Handles OAuth2 authentication failures for both Google and GitHub providers.
 * Redirects the user to the frontend error page without exposing sensitive
 * details.
 */
@Component
@Slf4j
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {

        // Extract the provider from the request URI if possible
        String provider = extractProvider(request.getRequestURI());

        // Log the error server-side only — never send exception details to the client
        log.warn("OAuth2 authentication failed for provider={}: {}", provider, exception.getMessage());

        String baseUrl = resolveBaseUrl();
        String targetUrl = baseUrl + "/oauth2/error?provider=" + provider;

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String extractProvider(String requestUri) {
        if (requestUri == null)
            return "unknown";
        if (requestUri.contains("google"))
            return "google";
        if (requestUri.contains("github"))
            return "github";
        return "unknown";
    }

    private String resolveBaseUrl() {
        String baseUrl = frontendUrl;
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            baseUrl = frontendUrl.trim();
        }
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl;
    }
}
