package com.exaple.codeEditer.Code.Editor.service;

import io.github.bucket4j.*;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    // Separate buckets per user per endpoint type
    private final Map<String, Bucket> executionBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> aiBuckets = new ConcurrentHashMap<>();

    /** 10 executions per user per minute */
    public boolean allowExecution(String userEmail) {
        Bucket bucket = executionBuckets.computeIfAbsent(
            userEmail, k -> Bucket.builder()
                .addLimit(Bandwidth.builder()
                    .capacity(10)
                    .refillGreedy(10, Duration.ofMinutes(1))
                    .build())
                .build()
        );
        return bucket.tryConsume(1);
    }

    /** 20 AI messages per user per minute */
    public boolean allowAiChat(String userEmail) {
        Bucket bucket = aiBuckets.computeIfAbsent(
            userEmail, k -> Bucket.builder()
                .addLimit(Bandwidth.builder()
                    .capacity(20)
                    .refillGreedy(20, Duration.ofMinutes(1))
                    .build())
                .build()
        );
        return bucket.tryConsume(1);
    }
}