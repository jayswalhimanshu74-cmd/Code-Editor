package com.exaple.codeEditer.Code.Editor.health;

import com.exaple.codeEditer.Code.Editor.service.execution.ExecutionProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ExecutionEngineHealthIndicator implements HealthIndicator {

    private final ExecutionProvider executionProvider;

    @Value("${execution.provider:piston}")
    private String configuredProvider;

    @Override
    public Health health() {
        try {
            if (executionProvider == null) {
                return Health.down()
                        .withDetail("configuredProvider", configuredProvider)
                        .withDetail("error", "No ExecutionProvider bean registered")
                        .build();
            }

            return Health.up()
                    .withDetail("providerName", executionProvider.getProviderName())
                    .withDetail("configuredProvider", configuredProvider)
                    .withDetail("status", "READY")
                    .build();
        } catch (Exception e) {
            return Health.down(e)
                    .withDetail("configuredProvider", configuredProvider)
                    .build();
        }
    }
}
