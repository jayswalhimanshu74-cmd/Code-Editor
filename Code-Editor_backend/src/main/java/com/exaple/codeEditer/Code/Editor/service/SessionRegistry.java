package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionRegistry {

    private final StringRedisTemplate stringRedisTemplate;
    private static final String SESSION_KEY_PREFIX = "ws:session:";

    public void registerSession(String sessionId, String userEmail, String roomId) {
        String key = SESSION_KEY_PREFIX + sessionId;
        stringRedisTemplate.opsForHash().put(key, "userEmail", userEmail);
        stringRedisTemplate.opsForHash().put(key, "roomId", roomId);
        stringRedisTemplate.expire(key, 2, TimeUnit.HOURS);
        log.info("Registered WebSocket session {} for user {} in room {}", sessionId, userEmail, roomId);
    }

    public void unregisterSession(String sessionId) {
        String key = SESSION_KEY_PREFIX + sessionId;
        stringRedisTemplate.delete(key);
        log.info("Unregistered WebSocket session {}", sessionId);
    }

    public String getUserEmail(String sessionId) {
        String key = SESSION_KEY_PREFIX + sessionId;
        Object val = stringRedisTemplate.opsForHash().get(key, "userEmail");
        return val != null ? val.toString() : null;
    }

    public String getRoomId(String sessionId) {
        String key = SESSION_KEY_PREFIX + sessionId;
        Object val = stringRedisTemplate.opsForHash().get(key, "roomId");
        return val != null ? val.toString() : null;
    }
}
