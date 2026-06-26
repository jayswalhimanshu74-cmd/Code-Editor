package com.exaple.codeEditer.Code.Editor.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final com.exaple.codeEditer.Code.Editor.repository.RoomMemberRepository roomMemberRepository;
    private final com.exaple.codeEditer.Code.Editor.repository.UserRepository userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                handleConnect(accessor);
            } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                handleSubscribe(accessor);
            } else if (StompCommand.SEND.equals(accessor.getCommand())) {
                handleSend(accessor);
            }
        }
        return message;
    }

    private void handleSend(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination != null && (destination.startsWith("/app/room/") || destination.startsWith("/app/yjs/"))) {
            String[] parts = destination.split("/");
            if (parts.length >= 4) {
                String roomIdStr = parts[3];
                try {
                    java.util.UUID roomId = java.util.UUID.fromString(roomIdStr);
                    Object user = accessor.getUser();
                    if (user instanceof UsernamePasswordAuthenticationToken auth) {
                        String email = auth.getName();
                        if (!roomMemberRepository.existsByRoomIdAndUserEmail(roomId, email)) {
                            log.warn("User {} unauthorized to SEND to room {}", email, roomId);
                            throw new org.springframework.messaging.MessagingException("Unauthorized to send message to this room");
                        }
                    } else {
                        log.warn("Unauthenticated user attempt to SEND to {}", destination);
                        throw new org.springframework.messaging.MessagingException("Authentication required");
                    }
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid room ID in send destination: {}", destination);
                }
            }
        }
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        log.debug("WebSocket connect attempt with auth header: {}", authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtService.isTokenValid(token)) {
                String email = jwtService.extractEmail(token);
                
                // Check if token was issued before last logout
                var user = userRepository.findByEmail(email).orElse(null);
                if (user != null && user.getLastLogoutAt() != null) {
                    java.util.Date issuedAt = jwtService.extractIssuedAt(token);
                    java.time.LocalDateTime issuedAtLDT = issuedAt.toInstant()
                            .atZone(java.time.ZoneId.systemDefault())
                            .toLocalDateTime();
                    
                    if (issuedAtLDT.isBefore(user.getLastLogoutAt())) {
                        log.warn("WebSocket connect attempt with invalidated token for user: {}", email);
                        return; // Don't set user, connection will be unauthenticated
                    }
                }

                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                accessor.setUser(authentication);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
    }

    private void handleSubscribe(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination != null && (destination.startsWith("/topic/room/") || destination.startsWith("/topic/yjs/"))) {
            // Destination format: /topic/room/{roomId} or /topic/yjs/{roomId}/...
            String[] parts = destination.split("/");
            if (parts.length >= 4) {
                String roomIdStr = parts[3];
                try {
                    java.util.UUID roomId = java.util.UUID.fromString(roomIdStr);
                    Object user = accessor.getUser();
                    if (user instanceof UsernamePasswordAuthenticationToken auth) {
                        String email = auth.getName();
                        if (!roomMemberRepository.existsByRoomIdAndUserEmail(roomId, email)) {
                            log.warn("User {} unauthorized for room {}", email, roomId);
                            throw new org.springframework.messaging.MessagingException("Unauthorized to subscribe to this room");
                        }
                    } else {
                        log.warn("Unauthenticated user attempt to subscribe to {}", destination);
                        throw new org.springframework.messaging.MessagingException("Authentication required");
                    }
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid room ID in destination: {}", destination);
                }
            }
        }
    }
}

