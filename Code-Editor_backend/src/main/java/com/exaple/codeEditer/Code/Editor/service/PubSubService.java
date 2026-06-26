package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PubSubService {

    private final RedisPublisher redisPublisher;

    public void publishEvent(String topic, Object event) {
        log.debug("Publishing event to topic {}: {}", topic, event);
        redisPublisher.publish(topic, event);
    }
}
