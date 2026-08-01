package com.exaple.codeEditer.Code.Editor.service.execution;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class ExecutionProviderConfig {

    @Value("${execution.provider:piston}")
    private String providerType;

    @Bean
    @Primary
    public ExecutionProvider activeExecutionProvider(
            PistonExecutionProvider pistonProvider,
            Judge0ExecutionProvider judge0Provider) {
        if ("judge0".equalsIgnoreCase(providerType)) {
            return judge0Provider;
        }
        return pistonProvider;
    }
}
