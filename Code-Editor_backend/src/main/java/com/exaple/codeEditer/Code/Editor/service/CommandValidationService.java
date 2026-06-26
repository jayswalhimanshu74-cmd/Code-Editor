package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommandValidationService {

    private final InputSanitizer inputSanitizer;
    private final AllowedCommandPolicy allowedCommandPolicy;
    private final AuditLogService auditLogService;

    public String validateAndSanitize(String command) {
        if (command == null || command.isBlank()) {
            return "";
        }

        String sanitized = inputSanitizer.sanitizeCommand(command);
        
        // Parse the base command
        String baseCmd = sanitized.trim();
        if (baseCmd.startsWith("./")) {
            baseCmd = baseCmd.substring(2);
        }

        if (!allowedCommandPolicy.isCommandAllowed(baseCmd)) {
            String errorMsg = "Security Block: Command '" + baseCmd + "' is restricted.";
            log.warn(errorMsg);
            auditLogService.log("SECURITY_EVENT_BLOCKED_COMMAND", "COMMAND", baseCmd, "User attempted restricted command execution");
            throw new SecurityException(errorMsg);
        }

        return sanitized;
    }
}
