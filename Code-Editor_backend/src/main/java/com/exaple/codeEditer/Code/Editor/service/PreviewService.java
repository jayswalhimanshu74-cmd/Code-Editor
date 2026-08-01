package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.WorkspacePort;
import com.exaple.codeEditer.Code.Editor.repository.WorkspacePortRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreviewService {

    private final WorkspacePortRepository workspacePortRepository;

    /**
     * Registers a port for preview without Traefik proxy.
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

        log.info("Registered preview port {} for room {}", port, roomId);
        return "/api/preview/" + roomId + "/ports/" + port + "/content";
    }

    public List<WorkspacePort> getRegisteredPorts(String roomId) {
        return workspacePortRepository.findByWorkspaceId(roomId);
    }

    public void removeWorkspaceRoutes(String roomId) {
        workspacePortRepository.deleteByWorkspaceId(roomId);
        log.info("Removed preview routes for room {}", roomId);
    }
}
