package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.AuditLogEntity;
import com.exaple.codeEditer.Code.Editor.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final HttpServletRequest request;

    public void log(String eventType, String resourceType, String resourceId, String metadata) {
        String userId = "anonymous";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            userId = auth.getName();
        }

        String ipAddress = "unknown";
        try {
            if (request != null) {
                String xForwarded = request.getHeader("X-Forwarded-For");
                if (xForwarded != null && !xForwarded.isBlank()) {
                    ipAddress = xForwarded.split(",")[0].trim();
                } else {
                    ipAddress = request.getRemoteAddr();
                }
            }
        } catch (IllegalStateException e) {
            ipAddress = "websocket-context";
        }

        AuditLogEntity logEntry = AuditLogEntity.builder()
                .userId(userId)
                .eventType(eventType)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .ipAddress(ipAddress)
                .metadata(metadata)
                .build();

        auditLogRepository.save(logEntry);
        log.info("Audit Logged: {} by user {} on resource {}/{} (IP: {})", 
                eventType, userId, resourceType, resourceId, ipAddress);
    }

    public List<AuditLogEntity> getAllLogs() {
        return auditLogRepository.findAll();
    }

    public List<AuditLogEntity> getLogsByUser(String userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
