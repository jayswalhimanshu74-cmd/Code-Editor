package com.exaple.codeEditer.Code.Editor.security;

import com.exaple.codeEditer.Code.Editor.service.RateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

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
                sendTooManyRequestsError(request, response, "Too many login attempts. Please try again later.");
                return;
            }
        } else if (uri.startsWith("/api/auth/register")) {
            String ip = getClientIp(request);
            if (!rateLimitService.allowRegister(ip)) {
                sendTooManyRequestsError(request, response, "Too many registration attempts. Please try again later.");
                return;
            }
        }

        // 2. User-based rate limiting for sensitive state-modifying actions
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            String email = auth.getName();

            if (uri.startsWith("/api/git")) {
                if (!rateLimitService.allowGit(email)) {
                    sendTooManyRequestsError(request, response, "Rate limit exceeded for Git operations.");
                    return;
                }
            } else if (uri.startsWith("/api/rooms") && method.equalsIgnoreCase("POST")) {
                if (!rateLimitService.allowWorkspaceCreation(email)) {
                    sendTooManyRequestsError(request, response, "Rate limit exceeded for workspace creation.");
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

    private void sendTooManyRequestsError(HttpServletRequest request, HttpServletResponse response, String message) throws IOException {
        response.setStatus(429); // 429 Too Many Requests
        response.setContentType("application/problem+json");
        response.setHeader("Retry-After", "60");

        String correlationId = MDC.get("correlationId");
        String requestId = MDC.get("requestId");

        String json = String.format("""
                {
                  "type": "https://hencecode.com/errors/rate-limit-exceeded",
                  "title": "Too Many Requests",
                  "status": 429,
                  "detail": "%s",
                  "instance": "%s",
                  "timestamp": "%s",
                  "correlationId": "%s",
                  "requestId": "%s"
                }
                """,
                message,
                request.getRequestURI(),
                Instant.now().toString(),
                correlationId != null ? correlationId : "",
                requestId != null ? requestId : ""
        );

        response.getWriter().write(json);
    }
}
