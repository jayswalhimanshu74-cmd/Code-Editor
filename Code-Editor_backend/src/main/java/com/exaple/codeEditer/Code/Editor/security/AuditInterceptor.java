package com.exaple.codeEditer.Code.Editor.security;

import com.exaple.codeEditer.Code.Editor.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class AuditInterceptor implements HandlerInterceptor {

    private final AuditLogService auditLogService;

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        String method = request.getMethod();
        String uri = request.getRequestURI();

        // Check if the request is state-modifying and targets the API space
        if (uri.startsWith("/api") && (method.equals("POST") || method.equals("PUT") || method.equals("DELETE"))) {
            int status = response.getStatus();
            String metadata = String.format("Method=%s, Status=%d", method, status);
            if (ex != null) {
                metadata += ", Exception=" + ex.getMessage();
            }
            auditLogService.log("API_REQUEST_" + method, "API_ENDPOINT", uri, metadata);
        }
    }
}
