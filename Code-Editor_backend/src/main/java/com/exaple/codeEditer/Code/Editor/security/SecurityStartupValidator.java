package com.exaple.codeEditer.Code.Editor.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class SecurityStartupValidator implements ApplicationListener<ApplicationReadyEvent> {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${github.token.encryption.key}")
    private String githubEncryptionKey;

    @Value("${admin.bootstrap.secret}")
    private String adminBootstrapSecret;

    @Value("${admin.bootstrap.enabled:false}")
    private boolean adminBootstrapEnabled;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    private static final List<String> WEAK_SECRETS = List.of(
            "changeme", "password123", "test-secret", "default-secret", "admin123", "secret"
    );

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        log.info("Running Security Startup Validation...");
        boolean hasError = false;

        hasError |= validateLength("app.jwt.secret", jwtSecret, 32);
        hasError |= validateLength("github.token.encryption.key", githubEncryptionKey, 32);
        
        if (adminBootstrapEnabled) {
            hasError |= validateLength("admin.bootstrap.secret", adminBootstrapSecret, 32);
            hasError |= scanForWeakSecrets("admin.bootstrap.secret", adminBootstrapSecret);
        }

        hasError |= scanForWeakSecrets("app.jwt.secret", jwtSecret);
        hasError |= scanForWeakSecrets("github.token.encryption.key", githubEncryptionKey);
        hasError |= scanForWeakSecrets("spring.datasource.password", dbPassword);

        if (hasError) {
            log.error("===================================================================");
            log.error("CRITICAL SECURITY ERROR: Application configuration failed validation.");
            log.error("The application cannot start until these security issues are resolved.");
            log.error("===================================================================");
            System.exit(1);
        }

        log.info("Security Startup Validation PASSED.");
    }

    private boolean validateLength(String propName, String value, int minLength) {
        if (value == null || value.trim().isEmpty()) {
            log.error("Security Validation Failed: {} is missing or empty.", propName);
            return true;
        }
        if (value.length() < minLength) {
            log.error("Security Validation Failed: {} must be at least {} characters long. (Current length: {})", propName, minLength, value.length());
            return true;
        }
        return false;
    }

    private boolean scanForWeakSecrets(String propName, String value) {
        if (value == null || value.trim().isEmpty()) return false;
        
        String lowerVal = value.toLowerCase();
        for (String weak : WEAK_SECRETS) {
            if (lowerVal.contains(weak)) {
                log.error("Security Validation Failed: {} contains a known weak secret string ('{}').", propName, weak);
                return true;
            }
        }
        return false;
    }
}
