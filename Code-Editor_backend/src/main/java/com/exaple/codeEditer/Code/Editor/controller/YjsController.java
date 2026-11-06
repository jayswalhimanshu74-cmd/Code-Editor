package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.entity.YjsDocument;
import com.exaple.codeEditer.Code.Editor.repository.YjsDocumentRepository;

import com.exaple.codeEditer.Code.Editor.config.SecurityUtill;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import com.exaple.codeEditer.Code.Editor.service.RedisPublisher;
import org.springframework.stereotype.Controller;
import org.slf4j.Logger;
  import java.util.Base64;

import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

@Controller
public class YjsController {

    private final RedisPublisher redisPublisher;
    private final YjsDocumentRepository yjsRepo;
    private final SecurityUtill securityUtill;
    private static final Logger log = LoggerFactory.getLogger(YjsController.class);

    public YjsController(RedisPublisher redisPublisher,
                         YjsDocumentRepository yjsRepo,
                         SecurityUtill securityUtill) {
        this.redisPublisher = redisPublisher;
        this.yjsRepo     = yjsRepo;
        this.securityUtill = securityUtill;
    }

    // ── Receive a Yjs binary update and broadcast to room ─────────────────────
    // Client sends to: /app/yjs/{roomId}/update
    // Server broadcasts to: /topic/yjs/{roomId}
    @MessageMapping("/yjs/{roomId}/update")
    public void handleYjsUpdate(
            @DestinationVariable String roomId,
            @Payload byte[] rawPayload
    ) {
        if (rawPayload == null || rawPayload.length == 0) {
            log.warn("[Yjs WS] Received null or empty payload for /yjs/{}/update", roomId);
            return;
        }

        try {
            String base64 = new String(rawPayload, java.nio.charset.StandardCharsets.UTF_8);
            byte[] update = Base64.getDecoder().decode(base64.trim());

            log.debug("[Yjs WS] update received: roomId={}, bytes={}", roomId, update.length);

            // Broadcast as Base64 string to matching destination
            String destination = "/topic/yjs/" + roomId;
            redisPublisher.publish(destination, Base64.getEncoder().encodeToString(update));
            log.debug("[Yjs WS] update broadcast to {}", destination);

        } catch (Exception e) {
            log.error("[Yjs WS] Failed to process update for room {}: {}", roomId, e.getMessage(), e);
        }
    }

    @MessageMapping("/yjs/{roomId}/file/{fileId}/update")
    public void handleFileYjsUpdate(
            @DestinationVariable String roomId,
            @DestinationVariable String fileId,
            @Payload byte[] rawPayload
    ) {
        if (rawPayload == null || rawPayload.length == 0) {
            log.warn("[Yjs WS] Received null or empty payload for /yjs/{}/file/{}/update", roomId, fileId);
            return;
        }

        try {
            String base64 = new String(rawPayload, java.nio.charset.StandardCharsets.UTF_8);
            byte[] update = Base64.getDecoder().decode(base64.trim());

            log.debug("[Yjs WS] update received: roomId={}, fileId={}, bytes={}", roomId, fileId, update.length);

            String destination = "/topic/yjs/" + roomId + "/file/" + fileId;
            redisPublisher.publish(destination, Base64.getEncoder().encodeToString(update));
            log.debug("[Yjs WS] update broadcast to {}", destination);

        } catch (Exception e) {
            log.error("[Yjs WS] Failed to process file update for room {}, file {}: {}", roomId, fileId, e.getMessage(), e);
        }
    }

    @MessageMapping("/yjs/{roomId}/awareness")
    public void handleAwareness(
            @DestinationVariable String roomId,
            @Payload byte[] rawPayload
    ) {
        if (rawPayload == null || rawPayload.length == 0) {
            log.warn("[Yjs WS] Received null or empty payload for /yjs/{}/awareness", roomId);
            return;
        }
        try {
            String base64 = new String(rawPayload, java.nio.charset.StandardCharsets.UTF_8);
            String destination = "/topic/yjs/" + roomId + "/awareness";
            redisPublisher.publish(destination, base64);
            log.debug("[Yjs WS] awareness broadcast to {}", destination);
        } catch (Exception e) {
            log.error("[Yjs WS] Awareness error for room {}: {}", roomId, e.getMessage(), e);
        }
    }

    @MessageMapping("/yjs/{roomId}/file/{fileId}/awareness")
    public void handleFileAwareness(
            @DestinationVariable String roomId,
            @DestinationVariable String fileId,
            @Payload byte[] rawPayload
    ) {
        if (rawPayload == null || rawPayload.length == 0) {
            log.warn("[Yjs WS] Received null or empty payload for /yjs/{}/file/{}/awareness", roomId, fileId);
            return;
        }
        try {
            String base64 = new String(rawPayload, java.nio.charset.StandardCharsets.UTF_8);
            String destination = "/topic/yjs/" + roomId + "/file/" + fileId + "/awareness";
            redisPublisher.publish(destination, base64);
            log.debug("[Yjs WS] file awareness broadcast to {}", destination);
        } catch (Exception e) {
            log.error("[Yjs WS] File awareness error for room {}, file {}: {}", roomId, fileId, e.getMessage(), e);
        }
    }
}