package com.exaple.codeEditer.Code.Editor.security;

import com.exaple.codeEditer.Code.Editor.service.RateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();

        // 1. IP-based rate limiting for Auth routes
        if (uri.startsWith("/api/auth/login")) {
            String ip = getClientIp(request);
            if (!rateLimitService.allowLogin(ip)) {
                sendTooManyRequestsError(response, "Too many login attempts. Please try again later.");
                return;
            }
        } else if (uri.startsWith("/api/auth/register")) {
            String ip = getClientIp(request);
            if (!rateLimitService.allowRegister(ip)) {
                sendTooManyRequestsError(response, "Too many registration attempts. Please try again later.");
                return;
            }
        }

        // 2. User-based rate limiting for sensitive state-modifying actions
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            String email = auth.getName();

            if (uri.startsWith("/api/git")) {
                if (!rateLimitService.allowGit(email)) {
                    sendTooManyRequestsError(response, "Rate limit exceeded for Git operations.");
                    return;
                }
            } else if (uri.startsWith("/api/rooms") && method.equalsIgnoreCase("POST")) {
                // Workspace creation is usually done by POSTing to /api/rooms or workspace provisioning endpoints
                if (!rateLimitService.allowWorkspaceCreation(email)) {
                    sendTooManyRequestsError(response, "Rate limit exceeded for workspace creation.");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwarded = request.getHeader("X-Forwarded-For");
        if (xForwarded != null && !xForwarded.isBlank()) {
            return xForwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendTooManyRequestsError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429); // Too Many Requests
        response.setContentType("application/json");
        response.getWriter().write(String.format("{\"error\": \"%s\"}", message));
    }
}
