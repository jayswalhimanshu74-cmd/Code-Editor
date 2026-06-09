package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.dto.ws.RedisMessageDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisPublisher {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final String TOPIC = "stomp-broker-relay";

    public void publish(String destination, Object payload) {
        try {
            // If the payload is already a string (like from Yjs), handle it directly,
            // otherwise serialize to JSON
            String payloadJson = payload instanceof String ? (String) payload : objectMapper.writeValueAsString(payload);
            
            RedisMessageDto message = RedisMessageDto.builder()
                    .destination(destination)
                    .payloadJson(payloadJson)
                    .build();

            redisTemplate.convertAndSend(TOPIC, message);
            log.debug("Published message to Redis for STOMP destination: {}", destination);
        } catch (Exception e) {
            log.error("Failed to publish message to Redis: {}", e.getMessage(), e);
        }
    }
}
