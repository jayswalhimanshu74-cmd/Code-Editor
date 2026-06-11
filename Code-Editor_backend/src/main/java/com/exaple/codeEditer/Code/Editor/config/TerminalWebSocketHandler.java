package com.exaple.codeEditer.Code.Editor.config;

import com.exaple.codeEditer.Code.Editor.service.DockerWorkspaceService;
import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.ExecCreateCmdResponse;
import com.github.dockerjava.api.model.Frame;
import com.github.dockerjava.core.command.ExecStartResultCallback;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.io.IOException;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class TerminalWebSocketHandler extends TextWebSocketHandler {

    private final DockerWorkspaceService dockerWorkspaceService;
    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private DockerClient dockerClient;

    // Map WebSocket Session ID to the PipedOutputStream for STDIN
    private final Map<String, PipedOutputStream> sessionInputStreams = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        java.security.Principal principal = session.getPrincipal();
        if (principal == null) {
            log.warn("Unauthenticated terminal connection attempt");
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthenticated"));
            return;
        }

        // Extract roomId from query parameter (e.g. /ws/terminal?roomId=uuid)
        String query = session.getUri().getQuery();
        String roomId = null;
        String username = principal.getName();
        String email = principal.getName();
        
        if (query != null) {
            String[] params = query.split("&");
            for (String param : params) {
                if (param.startsWith("roomId=")) {
                    roomId = param.substring(7);
                }
            }
        }

        if (roomId == null) {
            session.close(CloseStatus.BAD_DATA.withReason("Missing roomId"));
            return;
        }

        log.info("Terminal WebSocket connected for room: {}", roomId);

        try {
            // Ensure container is running
            String containerId = dockerWorkspaceService.provisionContainer(roomId);

            // Configure Git identity in the container
            try {
                ExecCreateCmdResponse configName = dockerClient.execCreateCmd(containerId)
                        .withCmd("git", "config", "--global", "user.name", username)
                        .exec();
                dockerClient.execStartCmd(configName.getId()).exec(new ExecStartResultCallback()).awaitCompletion();

                ExecCreateCmdResponse configEmail = dockerClient.execCreateCmd(containerId)
                        .withCmd("git", "config", "--global", "user.email", email)
                        .exec();
                dockerClient.execStartCmd(configEmail.getId()).exec(new ExecStartResultCallback()).awaitCompletion();
            } catch (Exception e) {
                log.warn("Failed to set git config in container {}", containerId, e);
            }

            // Create an Exec instance for /bin/bash
            ExecCreateCmdResponse exec = dockerClient.execCreateCmd(containerId)
                    .withAttachStdout(true)
                    .withAttachStderr(true)
                    .withAttachStdin(true)
                    .withTty(true) // Crucial for PTY colors/formatting
                    .withCmd("/bin/bash")
                    .exec();

            PipedInputStream in = new PipedInputStream();
            PipedOutputStream out = new PipedOutputStream(in);
            sessionInputStreams.put(session.getId(), out);

            // Start the Exec instance
            dockerClient.execStartCmd(exec.getId())
                    .withStdIn(in)
                    .withTty(true)
                    .exec(new ExecStartResultCallback() {
                        @Override
                        public void onNext(Frame item) {
                            try {
                                if (session.isOpen()) {
                                    session.sendMessage(new TextMessage(new String(item.getPayload(), StandardCharsets.UTF_8)));
                                }
                            } catch (IOException e) {
                                log.error("Failed to send terminal output to websocket", e);
                            }
                            super.onNext(item);
                        }
                    });
        } catch (Exception e) {
            log.error("Docker terminal initialization failed", e);
            session.sendMessage(new TextMessage("\r\n\u001B[31m[!] Server Error: Could not connect to Docker Daemon.\u001B[0m\r\n\u001B[31m[!] Please ensure Docker Desktop is running on the host machine.\u001B[0m\r\n"));
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        PipedOutputStream out = sessionInputStreams.get(session.getId());
        if (out != null) {
            String payload = message.getPayload();
            log.info("Received terminal input from frontend: {}", payload);
            out.write(payload.getBytes(StandardCharsets.UTF_8));
            out.flush();
        } else {
            log.warn("No PipedOutputStream found for session {}", session.getId());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        PipedOutputStream out = sessionInputStreams.remove(session.getId());
        if (out != null) {
            try {
                out.close();
            } catch (IOException ignored) {}
        }
        log.info("Terminal WebSocket disconnected: {}", session.getId());
    }
}
