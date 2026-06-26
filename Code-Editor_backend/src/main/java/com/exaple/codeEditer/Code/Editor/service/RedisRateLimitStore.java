package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisRateLimitStore {

    private final StringRedisTemplate stringRedisTemplate;

    public boolean isAllowed(String key, int limit, long durationSeconds) {
        String redisKey = "ratelimit:" + key;
        Long count = stringRedisTemplate.opsForValue().increment(redisKey);

        if (count == null) {
            return false;
        }

        if (count == 1) {
            stringRedisTemplate.expire(redisKey, durationSeconds, TimeUnit.SECONDS);
        }

        return count <= limit;
    }
}
