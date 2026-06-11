package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceNodeRegistry {

    private final RedisTemplate<String, Object> redisTemplate;
    
    // Generate a unique ID for this instance of the backend
    private final String NODE_ID = UUID.randomUUID().toString();
    
    private static final String REDIS_KEY_PREFIX = "workspace:owner:";

    /**
     * Register this node as the owner of the workspace container.
     */
    public void registerOwnership(String roomId) {
        String key = REDIS_KEY_PREFIX + roomId;
        redisTemplate.opsForValue().set(key, NODE_ID, Duration.ofHours(24));
        log.info("Node {} registered as owner for workspace {}", NODE_ID, roomId);
    }

    /**
     * Release ownership of the workspace container.
     */
    public void releaseOwnership(String roomId) {
        String key = REDIS_KEY_PREFIX + roomId;
        Object currentOwner = redisTemplate.opsForValue().get(key);
        if (NODE_ID.equals(currentOwner)) {
            redisTemplate.delete(key);
            log.info("Node {} released ownership for workspace {}", NODE_ID, roomId);
        }
    }

    /**
     * Check if THIS node is the owner of the workspace container.
     */
    public boolean isOwner(String roomId) {
        return NODE_ID.equals(getOwner(roomId));
    }
    
    /**
     * Get the node UUID that owns the workspace.
     */
    public String getOwner(String roomId) {
        String key = REDIS_KEY_PREFIX + roomId;
        Object currentOwner = redisTemplate.opsForValue().get(key);
        return currentOwner != null ? currentOwner.toString() : null;
    }
    
    public String getNodeId() {
        return NODE_ID;
    }
}
