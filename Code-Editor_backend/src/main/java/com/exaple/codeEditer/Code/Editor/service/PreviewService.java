package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.WorkspacePort;
import com.exaple.codeEditer.Code.Editor.repository.WorkspacePortRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreviewService {

    private final WorkspacePortRepository workspacePortRepository;

    /**
     * Registers a port for preview and generates the Traefik routing configuration.
     *
     * @param roomId The UUID of the workspace
     * @param port   The port number to expose
     * @return The Preview URL
     */
    public String registerPort(String roomId, int port) {
        Optional<WorkspacePort> existing = workspacePortRepository.findByWorkspaceIdAndPort(roomId, port);

        if (existing.isEmpty()) {
            WorkspacePort newPort = new WorkspacePort();
            newPort.setWorkspaceId(roomId);
            newPort.setPort(port);
            newPort.setStatus("ACTIVE");
            workspacePortRepository.save(newPort);
        }

        writeTraefikConfig(roomId, port);

        return "http://" + port + "-" + roomId + ".ide.localhost:8081";
    }

    public List<WorkspacePort> getRegisteredPorts(String roomId) {
        return workspacePortRepository.findByWorkspaceId(roomId);
    }

    private void writeTraefikConfig(String roomId, int port) {
        try {
            String routerName = "ws-" + roomId + "-" + port;
            String containerName = "workspace-" + roomId;
            String hostRule = "Host(`" + port + "-" + roomId + ".ide.localhost`)";

            // Generate a simple dynamic configuration for Traefik File Provider with ForwardAuth security
            String yamlContent = String.format("""
                    http:
                      routers:
                        %s:
                          rule: "%s"
                          service: "%s"
                          middlewares:
                            - %s-auth
                          entryPoints:
                            - web
                      middlewares:
                        %s-auth:
                          forwardAuth:
                            address: "http://host.docker.internal:8080/api/auth/forward"
                            trustForwardHeader: true
                      services:
                        %s:
                          loadBalancer:
                            servers:
                              - url: "http://%s:%d"
                            passHostHeader: true
                    """, routerName, hostRule, routerName, routerName, routerName, routerName, containerName, port);

            Path configPath = Paths.get(TraefikManagerService.TRAEFIK_CONFIG_DIR, routerName + ".yml");
            try (FileWriter writer = new FileWriter(configPath.toFile())) {
                writer.write(yamlContent);
            }

            log.info("Wrote Traefik routing config for room {} port {}", roomId, port);
        } catch (IOException e) {
            log.error("Failed to write Traefik configuration file", e);
            throw new RuntimeException("Failed to register preview routing", e);
        }
    }

    public void removeWorkspaceRoutes(String roomId) {
        List<WorkspacePort> ports = workspacePortRepository.findByWorkspaceId(roomId);
        for (WorkspacePort wp : ports) {
            Path configPath = Paths.get(TraefikManagerService.TRAEFIK_CONFIG_DIR, "ws-" + roomId + "-" + wp.getPort() + ".yml");
            try {
                Files.deleteIfExists(configPath);
            } catch (IOException e) {
                log.warn("Failed to delete Traefik config file {}", configPath, e);
            }
        }
        workspacePortRepository.deleteByWorkspaceId(roomId);
    }
}
