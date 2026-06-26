package com.exaple.codeEditer.Code.Editor.security;

import com.exaple.codeEditer.Code.Editor.service.PresenceService;
import com.exaple.codeEditer.Code.Editor.service.SessionRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final PresenceService presenceService;
    private final SessionRegistry sessionRegistry;

    @EventListener
    public void handleWebSocketConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() != null) {
            log.info("WS connected: {}", accessor.getUser().getName());
        }
    }

    @EventListener
    public void handleWebSocketSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String dest = accessor.getDestination();
        if (dest != null && (dest.contains("/topic/room/") || dest.contains("/topic/yjs/"))) {
            String roomId = dest.substring(dest.lastIndexOf('/') + 1);
            if (accessor.getUser() != null) {
                String userEmail = accessor.getUser().getName();
                String sessionId = accessor.getSessionId();
                presenceService.registerUserPresence(roomId, userEmail);
                sessionRegistry.registerSession(sessionId, userEmail, roomId);
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        
        String roomId = sessionRegistry.getRoomId(sessionId);
        String userEmail = sessionRegistry.getUserEmail(sessionId);
        
        if (roomId != null && userEmail != null) {
            presenceService.removeUserPresence(roomId, userEmail);
        }
        
        sessionRegistry.unregisterSession(sessionId);
        if (userEmail != null) {
            log.info("WS disconnected: {}", userEmail);
        }
    }
}