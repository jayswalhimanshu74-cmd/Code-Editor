package com.exaple.codeEditer.Code.Editor.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtTokenBlacklistService {

    private final StringRedisTemplate redisTemplate;
    private final Set<String> localBlacklistFallback = ConcurrentHashMap.newKeySet();
    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";

    public void blacklistToken(String token, long ttlSeconds) {
        if (token == null || token.isBlank()) return;
        long expiry = ttlSeconds > 0 ? ttlSeconds : 86400; // Default 24 hours
        try {
            redisTemplate.opsForValue().set(BLACKLIST_PREFIX + token, "revoked", Duration.ofSeconds(expiry));
            log.info("Token successfully blacklisted in Redis for {} seconds", expiry);
        } catch (Exception e) {
            log.warn("Redis unavailable for token blacklisting. Falling back to in-memory blacklist: {}", e.getMessage());
            localBlacklistFallback.add(token);
        }
    }

    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) return false;
        if (localBlacklistFallback.contains(token)) {
            return true;
        }
        try {
            Boolean exists = redisTemplate.hasKey(BLACKLIST_PREFIX + token);
            return Boolean.TRUE.equals(exists);
        } catch (Exception e) {
            log.warn("Redis check failed for blacklisted token check: {}", e.getMessage());
            return localBlacklistFallback.contains(token);
        }
    }
}
