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
    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> resetBuckets = new ConcurrentHashMap<>();

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

    /** 5 requests per IP per minute */
    public boolean allowLogin(String ip) {
        Bucket bucket = loginBuckets.computeIfAbsent(
            ip, k -> Bucket.builder()
                .addLimit(Bandwidth.builder()
                    .capacity(5)
                    .refillGreedy(5, Duration.ofMinutes(1))
                    .build())
                .build()
        );
        return bucket.tryConsume(1);
    }

    /** 3 requests per IP per minute */
    public boolean allowRegister(String ip) {
        Bucket bucket = registerBuckets.computeIfAbsent(
            ip, k -> Bucket.builder()
                .addLimit(Bandwidth.builder()
                    .capacity(3)
                    .refillGreedy(3, Duration.ofMinutes(1))
                    .build())
                .build()
        );
        return bucket.tryConsume(1);
    }

    /** 3 requests per IP per 15 minutes */
    public boolean allowPasswordReset(String ip) {
        Bucket bucket = resetBuckets.computeIfAbsent(
            ip, k -> Bucket.builder()
                .addLimit(Bandwidth.builder()
                    .capacity(3)
                    .refillGreedy(3, Duration.ofMinutes(15))
                    .build())
                .build()
        );
        return bucket.tryConsume(1);
    }
}