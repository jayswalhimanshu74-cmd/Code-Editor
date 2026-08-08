package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.dto.ws.RedisMessageDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

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

        log.info("REDIS MESSAGE RECEIVED: {}", body);

        RedisMessageDto dto =
                objectMapper.readValue(body, RedisMessageDto.class);

        log.info(
                "REDIS -> STOMP: destination={}, payload={}",
                dto.getDestination(),
                dto.getPayloadJson()
        );

        Object payloadToBroadcast;

        if (dto.getPayloadJson().startsWith("{")
                || dto.getPayloadJson().startsWith("[")) {

            payloadToBroadcast =
                    objectMapper.readTree(dto.getPayloadJson());

        } else {

            payloadToBroadcast =
                    dto.getPayloadJson();
        }

        messagingTemplate.convertAndSend(
                dto.getDestination(),
                payloadToBroadcast
        );

        log.info(
                "STOMP MESSAGE SENT: destination={}",
                dto.getDestination()
        );

    } catch (Exception e) {

        log.error(
                "Failed to process Redis pub/sub message",
                e
        );
    }
}
}