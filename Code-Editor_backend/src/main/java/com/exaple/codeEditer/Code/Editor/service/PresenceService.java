package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class PresenceService {

    private final StringRedisTemplate stringRedisTemplate;
    private static final String PRESENCE_KEY_PREFIX = "room:presence:";

    public void registerUserPresence(String roomId, String userEmail) {
        String key = PRESENCE_KEY_PREFIX + roomId;
        stringRedisTemplate.opsForSet().add(key, userEmail);
        stringRedisTemplate.expire(key, 12, TimeUnit.HOURS);
        log.info("Registered presence for user {} in room {}", userEmail, roomId);
    }

    public void removeUserPresence(String roomId, String userEmail) {
        String key = PRESENCE_KEY_PREFIX + roomId;
        stringRedisTemplate.opsForSet().remove(key, userEmail);
        log.info("Removed presence for user {} in room {}", userEmail, roomId);
    }

    public Set<String> getOnlineUsers(String roomId) {
        String key = PRESENCE_KEY_PREFIX + roomId;
        return stringRedisTemplate.opsForSet().members(key);
    }
}
