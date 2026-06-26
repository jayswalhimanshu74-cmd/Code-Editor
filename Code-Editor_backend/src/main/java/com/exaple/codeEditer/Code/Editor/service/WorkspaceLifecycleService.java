package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.WorkspaceEntity;
import com.exaple.codeEditer.Code.Editor.entity.WorkspaceStatus;
import com.exaple.codeEditer.Code.Editor.repository.WorkspaceRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceLifecycleService {

    private final WorkspaceRepository workspaceRepository;
    private final DockerWorkspaceService dockerWorkspaceService;
    private final WorkspaceNodeRegistry nodeRegistry;

    // Startup recovery is handled by WorkspaceStartupRecoveryJob to avoid resource race conditions during boot.

    public synchronized String startWorkspace(String roomId, String ownerId) {
        Optional<WorkspaceEntity> optionalWs = workspaceRepository.findById(roomId);
        WorkspaceEntity ws;

        if (optionalWs.isPresent()) {
            ws = optionalWs.get();
            if (ws.getStatus() == WorkspaceStatus.RUNNING) {
                String owner = nodeRegistry.getOwner(roomId);
                if (owner != null && !owner.equals(nodeRegistry.getNodeId())) {
                    // Another node owns this and Redis says it's active. Trust it's running.
                    log.info("Workspace {} is running on remote node {}.", roomId, owner);
                    return ws.getContainerId();
                } else if (dockerWorkspaceService.isContainerRunning(ws.getContainerId())) {
                    log.info("Workspace {} is already running on this node.", roomId);
                    return ws.getContainerId();
                }
            }
        } else {
            ws = new WorkspaceEntity();
            ws.setId(roomId);
            ws.setOwnerId(ownerId);
        }

        try {
            ws.setStatus(WorkspaceStatus.STARTING);
            workspaceRepository.save(ws);

            String containerId = dockerWorkspaceService.provisionContainer(roomId);

            ws.setContainerId(containerId);
            ws.setStatus(WorkspaceStatus.RUNNING);
            workspaceRepository.save(ws);

            nodeRegistry.registerOwnership(roomId);

            log.info("Successfully started workspace {} with container {}", roomId, containerId);
            return containerId;

        } catch (Exception e) {
            log.error("Failed to start workspace {}", roomId, e);
            ws.setStatus(WorkspaceStatus.ERROR);
            workspaceRepository.save(ws);
            throw new RuntimeException("Could not start workspace", e);
        }
    }

    public void stopWorkspace(String roomId) {
        workspaceRepository.findById(roomId).ifPresent(ws -> {
            try {
                dockerWorkspaceService.stopAndRemoveContainer(ws.getContainerId(), roomId);
                ws.setStatus(WorkspaceStatus.STOPPED);
                ws.setContainerId(null);
                workspaceRepository.save(ws);
                nodeRegistry.releaseOwnership(roomId);
                log.info("Stopped workspace {}", roomId);
            } catch (Exception e) {
                log.error("Failed to stop workspace {}", roomId, e);
                ws.setStatus(WorkspaceStatus.ERROR);
                workspaceRepository.save(ws);
            }
        });
    }

    public String getContainerId(String roomId) {
        return workspaceRepository.findById(roomId)
                .map(WorkspaceEntity::getContainerId)
                .orElse(null);
    }
}
