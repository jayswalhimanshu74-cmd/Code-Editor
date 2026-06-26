package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.WorkspaceEntity;
import com.exaple.codeEditer.Code.Editor.entity.WorkspaceStatus;
import com.exaple.codeEditer.Code.Editor.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceRecoveryService {

    private final WorkspaceRepository workspaceRepository;
    private final ContainerDiscoveryService containerDiscoveryService;
    private final ContainerReattachService containerReattachService;

    public void recoverWorkspace(String roomId) {
        Optional<WorkspaceEntity> optionalWs = workspaceRepository.findById(roomId);
        if (optionalWs.isEmpty()) {
            return;
        }

        WorkspaceEntity ws = optionalWs.get();
        Optional<String> runningContainerId = containerDiscoveryService.findRunningContainer(roomId);

        if (runningContainerId.isPresent()) {
            String containerId = runningContainerId.get();
            containerReattachService.reattachContainer(roomId, containerId);
            
            ws.setContainerId(containerId);
            ws.setStatus(WorkspaceStatus.RUNNING);
            ws.setLastSeen(LocalDateTime.now());
            workspaceRepository.save(ws);
            log.info("Successfully recovered running workspace {}", roomId);
        } else {
            ws.setStatus(WorkspaceStatus.STOPPED);
            ws.setContainerId(null);
            workspaceRepository.save(ws);
            log.info("Workspace {} has no running container. Set status to STOPPED.", roomId);
        }
    }
}
