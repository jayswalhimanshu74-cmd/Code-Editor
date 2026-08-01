package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.WorkspaceEntity;
import com.exaple.codeEditer.Code.Editor.entity.WorkspaceStatus;
import com.exaple.codeEditer.Code.Editor.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceLifecycleService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceNodeRegistry nodeRegistry;

    private static final String HOST_WORKSPACES_DIR = System.getProperty("user.dir") + "/cloud-workspaces";

    public synchronized String startWorkspace(String roomId, String ownerId) {
        Optional<WorkspaceEntity> optionalWs = workspaceRepository.findById(roomId);
        WorkspaceEntity ws;

        if (optionalWs.isPresent()) {
            ws = optionalWs.get();
            if (ws.getStatus() == WorkspaceStatus.RUNNING) {
                String owner = nodeRegistry.getOwner(roomId);
                if (owner != null && !owner.equals(nodeRegistry.getNodeId())) {
                    log.info("Workspace {} is running on remote node {}.", roomId, owner);
                    return "fs-" + roomId;
                } else if (isWorkspaceDirectoryPresent(roomId)) {
                    log.info("Workspace directory for {} is already active on this node.", roomId);
                    return "fs-" + roomId;
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

            ensureWorkspaceDirectoryExists(roomId);
            String containerId = "fs-" + roomId;

            ws.setContainerId(containerId);
            ws.setStatus(WorkspaceStatus.RUNNING);
            ws.setLastSeen(LocalDateTime.now());
            workspaceRepository.save(ws);

            nodeRegistry.registerOwnership(roomId);

            log.info("Successfully initialized local workspace directory for room {}", roomId);
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
                .orElse("fs-" + roomId);
    }

    private void ensureWorkspaceDirectoryExists(String roomId) throws Exception {
        Path path = Paths.get(HOST_WORKSPACES_DIR, roomId);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }
    }

    private boolean isWorkspaceDirectoryPresent(String roomId) {
        Path path = Paths.get(HOST_WORKSPACES_DIR, roomId);
        return Files.exists(path) && Files.isDirectory(path);
    }
}
