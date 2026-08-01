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
        String luaScript =
                "local count = redis.call('INCR', KEYS[1]) " +
                "if tonumber(count) == 1 then " +
                "  redis.call('EXPIRE', KEYS[1], ARGV[1]) " +
                "end " +
                "return count";

        org.springframework.data.redis.core.script.RedisScript<Long> script =
                new org.springframework.data.redis.core.script.DefaultRedisScript<>(luaScript, Long.class);

        Long count = stringRedisTemplate.execute(script, java.util.Collections.singletonList(redisKey), String.valueOf(durationSeconds));

        if (count == null) {
            return false;
        }

        return count <= limit;
    }
}
