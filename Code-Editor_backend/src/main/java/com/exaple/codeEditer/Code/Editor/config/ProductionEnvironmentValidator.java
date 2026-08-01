package com.exaple.codeEditer.Code.Editor.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.util.Arrays;

@Configuration
@Slf4j
public class ProductionEnvironmentValidator {

    private final Environment environment;

    @Value("${app.jwt.secret:}")
    private String jwtSecret;

    @Value("${spring.datasource.url:}")
    private String dbUrl;

    public ProductionEnvironmentValidator(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validateEnvironment() {
        boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        log.info("HenceCode application starting. Active profiles: {}", Arrays.toString(environment.getActiveProfiles()));

        if (isProd) {
            log.info("Validating production environment variables and security constraints...");

            if (jwtSecret == null || jwtSecret.isBlank() || jwtSecret.contains("dummy") || jwtSecret.length() < 32) {
                log.warn("SECURITY ALERT: Production JWT Secret should be at least 32 high-entropy characters!");
            }

            if (dbUrl == null || dbUrl.isBlank()) {
                log.error("CRITICAL CONFIGURATION ERROR: Database URL is missing in production environment!");
                throw new IllegalStateException("Production deployment halted: missing SPRING_DATASOURCE_URL/DATABASE_URL");
            }

            log.info("Production environment startup validation PASSED.");
        }
    }
}
