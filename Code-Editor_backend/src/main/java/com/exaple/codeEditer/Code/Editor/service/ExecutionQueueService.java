package com.exaple.codeEditer.Code.Editor.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExecutionQueueService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public void enqueueExecution(UUID roomId, String execId) {
        String queueKey = "execution:queue:" + roomId.toString();
        try {
            redisTemplate.opsForList().rightPush(queueKey, execId);
            log.info("Queued execution {} for room {}", execId, roomId);
        } catch (Exception e) {
            log.error("Failed to enqueue execution {}", execId, e);
            throw new RuntimeException("Redis Queue failed", e);
        }
    }
}
