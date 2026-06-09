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
@Transactional
public void handleYjsUpdate(
        @DestinationVariable String roomId,
        @Payload byte[] rawPayload
) {
    if (rawPayload == null || rawPayload.length == 0) return;

    try {
        String base64 = new String(rawPayload, java.nio.charset.StandardCharsets.UTF_8);
        byte[] update = Base64.getDecoder().decode(base64.trim());

        log.debug("[Yjs] Received {} bytes for room {}", update.length, roomId);


        YjsDocument doc = yjsRepo
                .findByRoomIdAndFileIdIsNull(roomId)
                .orElseGet(() -> {
                    YjsDocument d = new YjsDocument();
                    d.setRoomId(roomId);
                    return d;
                });

        doc.setState(update);
        yjsRepo.save(doc);

        // ✅ Broadcast as Base64 string — clients decode it
        redisPublisher.publish("/topic/yjs/" + 
                                    roomId,Base64.getEncoder().encodeToString(update));

    } catch (Exception e) {
        log.error("[Yjs] Failed to process update for room {}: {}", roomId, e.getMessage());
    }
}

@MessageMapping("/yjs/{roomId}/file/{fileId}/update")
@Transactional
public void handleFileYjsUpdate(
        @DestinationVariable String roomId,
        @DestinationVariable String fileId,
         @Payload byte[] rawPayload
) {
   if (rawPayload == null || rawPayload.length == 0) return;

    try {
        String base64 = new String(rawPayload, java.nio.charset.StandardCharsets.UTF_8);
        byte[] update = Base64.getDecoder().decode(base64.trim());
        
        log.debug("[Yjs] Received {} bytes for room {}/file {}", update.length, roomId, fileId);

        YjsDocument doc = yjsRepo
                .findByRoomIdAndFileId(roomId, fileId)
                .orElseGet(() -> {
                    YjsDocument d = new YjsDocument();
                    d.setRoomId(roomId);
                    d.setFileId(fileId);
                    return d;
                });

        doc.setState(update);
        yjsRepo.save(doc);

        redisPublisher.publish(
            "/topic/yjs/" + roomId + "/file/" + fileId,
             Base64.getEncoder().encodeToString(update)
        );

    } catch (Exception e) {
        log.error("[Yjs] Failed to process file update: {}", e.getMessage());
    }
  }
  @MessageMapping("/yjs/{roomId}/awareness")
public void handleAwareness(
        @DestinationVariable String roomId,
        @Payload byte[] rawPayload
) {
    if (rawPayload == null || rawPayload.length == 0) return;
    try {
        String base64 = new String(rawPayload, java.nio.charset.StandardCharsets.UTF_8);
        // Broadcast awareness to all room members
        redisPublisher.publish("/topic/yjs/" + roomId + "/awareness", base64);
    } catch (Exception e) {
        log.error("[Yjs] Awareness error for room {}: {}", roomId, e.getMessage());
    }
}

@MessageMapping("/yjs/{roomId}/file/{fileId}/awareness")
public void handleFileAwareness(
        @DestinationVariable String roomId,
        @DestinationVariable String fileId,
        @Payload byte[] rawPayload
) {
    if (rawPayload == null || rawPayload.length == 0) return;
    try {
        String base64 = new String(rawPayload, java.nio.charset.StandardCharsets.UTF_8);
        redisPublisher.publish(
            "/topic/yjs/" + roomId + "/file/" + fileId + "/awareness",
            base64
        );
    } catch (Exception e) {
        log.error("[Yjs] File awareness error: {}", e.getMessage());
    }
}
}