package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.WorkspaceEntity;
import com.exaple.codeEditer.Code.Editor.entity.WorkspaceStatus;
import com.exaple.codeEditer.Code.Editor.repository.WorkspaceRepository;
import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.model.Container;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContainerCleanupService {

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private DockerClient dockerClient;
    private final WorkspaceRepository workspaceRepository;
    private final DockerWorkspaceService dockerWorkspaceService;

    public void cleanupAbandonedContainers() {
        log.info("Running container cleanup sweep...");
        try {
            List<Container> containers = dockerClient.listContainersCmd().withShowAll(true).exec();
            List<WorkspaceEntity> activeDbWorkspaces = workspaceRepository.findAll();
            
            Set<String> activeContainerIds = activeDbWorkspaces.stream()
                    .filter(w -> w.getStatus() == WorkspaceStatus.RUNNING)
                    .map(WorkspaceEntity::getContainerId)
                    .collect(Collectors.toSet());

            for (Container c : containers) {
                String name = c.getNames().length > 0 ? c.getNames()[0] : "";
                if (name.startsWith("/workspace-")) {
                    String roomId = name.substring("/workspace-".length());
                    
                    // Stop container if it is not in the active running set or if the workspace has expired/inactive
                    if (!activeContainerIds.contains(c.getId())) {
                        log.info("Stopping and removing orphaned/inactive workspace container: {}", name);
                        try {
                            dockerWorkspaceService.stopAndRemoveContainer(c.getId(), roomId);
                        } catch (Exception e) {
                            log.warn("Failed to stop container {}: {}", c.getId(), e.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to run container cleanup sweep", e);
        }
    }
}
