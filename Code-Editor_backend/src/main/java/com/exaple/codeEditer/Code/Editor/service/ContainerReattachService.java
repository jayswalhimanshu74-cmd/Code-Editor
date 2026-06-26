package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.WorkspacePort;
import com.exaple.codeEditer.Code.Editor.repository.WorkspacePortRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContainerReattachService {

    private final DockerWorkspaceService dockerWorkspaceService;
    private final WorkspaceNodeRegistry workspaceNodeRegistry;
    private final PreviewService previewService;
    private final WorkspacePortRepository workspacePortRepository;

    public void reattachContainer(String roomId, String containerId) {
        log.info("Reattaching to workspace {} via container {}", roomId, containerId);
        
        // 1. Register within DockerWorkspaceService memory map
        dockerWorkspaceService.registerRunningWorkspace(roomId, containerId);

        // 2. Re-establish Redis/Node ownership
        workspaceNodeRegistry.registerOwnership(roomId);

        // 3. Recreate Traefik routes for all active preview ports
        try {
            List<WorkspacePort> ports = workspacePortRepository.findByWorkspaceId(roomId);
            for (WorkspacePort wp : ports) {
                log.info("Restoring preview route for workspace {} on port {}", roomId, wp.getPort());
                previewService.registerPort(roomId, wp.getPort());
            }
        } catch (Exception e) {
            log.error("Failed to restore preview routes during reattach for room {}", roomId, e);
        }
    }
}
