package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class LockService {

    private final StringRedisTemplate stringRedisTemplate;
    private static final String LOCK_KEY_PREFIX = "lock:";

    public boolean acquireLock(String lockName, Duration expiration) {
        String key = LOCK_KEY_PREFIX + lockName;
        Boolean success = stringRedisTemplate.opsForValue().setIfAbsent(key, "locked", expiration);
        return Boolean.TRUE.equals(success);
    }

    public void releaseLock(String lockName) {
        String key = LOCK_KEY_PREFIX + lockName;
        stringRedisTemplate.delete(key);
    }
}
