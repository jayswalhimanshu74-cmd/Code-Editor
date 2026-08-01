package com.exaple.codeEditer.Code.Editor.config;

import com.exaple.codeEditer.Code.Editor.service.AuditLogService;
import com.exaple.codeEditer.Code.Editor.service.AuthorizationService;
import com.exaple.codeEditer.Code.Editor.service.BusinessMetricsService;
import com.exaple.codeEditer.Code.Editor.service.PathSecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class TerminalWebSocketHandler extends TextWebSocketHandler {

    private final AuthorizationService authorizationService;
    private final AuditLogService auditLogService;
    private final PathSecurityService pathSecurityService;
    private final BusinessMetricsService businessMetricsService;

    private final Map<String, String> sessionRoomMap = new ConcurrentHashMap<>();
    private static final String HOST_WORKSPACES_DIR = System.getProperty("user.dir") + "/cloud-workspaces";

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        java.security.Principal principal = session.getPrincipal();
        if (principal == null) {
            log.warn("Unauthenticated terminal connection attempt");
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthenticated"));
            return;
        }

        String query = session.getUri().getQuery();
        String roomId = null;
        String username = principal.getName();

        if (query != null) {
            String[] params = query.split("&");
            for (String param : params) {
                if (param.startsWith("roomId=")) {
                    roomId = param.substring(7);
                    break;
                }
            }
        }

        if (roomId == null) {
            session.close(CloseStatus.BAD_DATA.withReason("Missing roomId query parameter"));
            return;
        }

        if (!authorizationService.hasPermission(username, roomId, "TERMINAL_ACCESS")) {
            log.warn("User {} attempted unauthorized terminal access to room {}", username, roomId);
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthorized workspace access"));
            return;
        }

        sessionRoomMap.put(session.getId(), roomId);
        businessMetricsService.incrementTerminalSessions();
        auditLogService.log("TERMINAL_CONNECT", "WORKSPACE", roomId, "Connected to terminal for workspace: " + roomId);

        String banner = """
                \r\n\033[1;32m===================================================\033[0m
                \033[1;36m  Welcome to HenceCode Workspace Pseudo-Terminal   \033[0m
                \033[1;32m===================================================\033[0m
                Type \033[1;33mhelp\033[0m to list available workspace commands.
                \r\n$ \
                """;
        session.sendMessage(new TextMessage(banner));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String input = message.getPayload() != null ? message.getPayload().trim() : "";
        String roomId = sessionRoomMap.get(session.getId());

        if (roomId == null) {
            session.close(CloseStatus.SERVER_ERROR);
            return;
        }

        if (input.isEmpty()) {
            session.sendMessage(new TextMessage("$ "));
            return;
        }

        String response = processPseudoCommand(roomId, input);
        session.sendMessage(new TextMessage(response + "\r\n$ "));
    }

    private String processPseudoCommand(String roomId, String input) {
        String[] tokens = input.split("\\s+");
        String cmd = tokens[0].toLowerCase();

        Path workspacePath = Paths.get(HOST_WORKSPACES_DIR, roomId);

        return switch (cmd) {
            case "help" -> """
                    Available Workspace Commands:
                      help             - Show this help menu
                      pwd              - Show workspace directory path
                      ls               - List files in current workspace
                      cat <file>       - Display contents of a file
                      clear            - Clear terminal output
                      status           - Display workspace engine status
                      echo <text>      - Echo input text
                    """;
            case "pwd" -> "/workspace/" + roomId;
            case "ls" -> {
                try {
                    File wsDir = workspacePath.toFile();
                    if (!wsDir.exists()) {
                        yield "Workspace directory empty.";
                    }
                    File[] files = wsDir.listFiles();
                    if (files == null || files.length == 0) {
                        yield "Workspace directory empty.";
                    }
                    StringBuilder sb = new StringBuilder();
                    for (File f : files) {
                        sb.append(f.isDirectory() ? "[DIR]  " : "[FILE] ").append(f.getName()).append("\r\n");
                    }
                    yield sb.toString().trim();
                } catch (Exception e) {
                    yield "Error listing directory: " + e.getMessage();
                }
            }
            case "cat" -> {
                if (tokens.length < 2) yield "Usage: cat <filename>";
                String fileName = tokens[1];
                if (!pathSecurityService.isNameSafe(fileName)) {
                    yield "Security Error: Invalid filename or path traversal detected.";
                }
                File target = new File(workspacePath.toFile(), fileName);
                if (!target.exists() || !target.isFile()) {
                    yield "File not found: " + fileName;
                }
                try {
                    yield Files.readString(target.toPath());
                } catch (Exception e) {
                    yield "Error reading file: " + e.getMessage();
                }
            }
            case "clear" -> "\033[2J\033[H";
            case "status" -> "HenceCode Cloud Terminal Engine: ONLINE (Render/Vercel Architecture)";
            case "echo" -> input.length() > 5 ? input.substring(5) : "";
            default -> "Command not found: " + cmd + ". Type 'help' for available commands.";
        };
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        if (sessionRoomMap.remove(session.getId()) != null) {
            businessMetricsService.decrementTerminalSessions();
        }
    }
}
