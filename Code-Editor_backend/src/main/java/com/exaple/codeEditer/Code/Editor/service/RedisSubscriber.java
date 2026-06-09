package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.dto.ws.RedisMessageDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String body = new String(message.getBody());
            // Depending on Redis serializer, it might have double quotes or framing.
            // Spring Data Redis Jackson2JsonRedisSerializer handles it if configured, 
            // but let's assume we read it as a DTO.
            
            // Note: If using Jackson2JsonRedisSerializer, the body is JSON.
            RedisMessageDto dto = objectMapper.readValue(body, RedisMessageDto.class);
            
            // If the destination is YJS (base64 string), we can send the raw string.
            // Otherwise, we might want to deserialize it to an object or just send the JSON string.
            // Spring's messagingTemplate.convertAndSend will accept the raw string and send it as text if the client expects text.
            // However, STOMP clients parse JSON. If we send a JSON string, Spring might double quote it.
            // A safer approach: send the payload string if it's yjs (which is base64), 
            // or pass it as raw JSON using standard mapping, but we don't have the original class.
            // But wait, if we send payloadJson, STOMP clients using SockJS might receive a stringified string.
            // Let's decode it back to Object if it looks like JSON.
            
            Object payloadToBroadcast;
            if (dto.getPayloadJson().startsWith("{") || dto.getPayloadJson().startsWith("[")) {
                // Parse as generic JSON node to prevent double stringification
                payloadToBroadcast = objectMapper.readTree(dto.getPayloadJson());
            } else {
                // String payload (e.g. Yjs base64)
                payloadToBroadcast = dto.getPayloadJson();
            }

            messagingTemplate.convertAndSend(dto.getDestination(), payloadToBroadcast);
            log.debug("Broadcasted Redis message to local STOMP clients on: {}", dto.getDestination());
        } catch (Exception e) {
            log.error("Failed to process Redis pub/sub message: {}", e.getMessage(), e);
        }
    }
}
