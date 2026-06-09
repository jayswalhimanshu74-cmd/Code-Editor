package com.exaple.codeEditer.Code.Editor.service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.model.HostConfig;
import com.github.dockerjava.api.model.Bind;
import com.github.dockerjava.api.model.Volume;
import com.exaple.codeEditer.Code.Editor.entity.File;
import com.exaple.codeEditer.Code.Editor.repository.FileRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class DockerWorkspaceService {

    private final DockerClient dockerClient;
    private final FileRepository fileRepository;
    private final RoomRepository roomRepository;
    
    // Map Room ID to Docker Container ID
    private final Map<String, String> activeWorkspaces = new ConcurrentHashMap<>();

    private static final String BASE_IMAGE = "ubuntu:22.04";
    private static final String HOST_WORKSPACES_DIR = System.getProperty("user.dir") + "/cloud-workspaces";

    /**
     * Spins up an isolated Linux container for the workspace.
     * 
     * @param roomId The UUID of the room/workspace
     * @return The ID of the created Docker container
     */
    public String startWorkspace(String roomId) {
        if (activeWorkspaces.containsKey(roomId)) {
            return activeWorkspaces.get(roomId);
        }

        try {
            // 1. Ensure image exists (pull if necessary)
            try {
                dockerClient.inspectImageCmd(BASE_IMAGE).exec();
            } catch (Exception e) {
                log.info("Pulling base image {}... this may take a moment.", BASE_IMAGE);
                dockerClient.pullImageCmd(BASE_IMAGE).start().awaitCompletion();
            }

            // 2. Sync database files to host filesystem
            syncWorkspaceToHost(roomId);
            String hostPath = Paths.get(HOST_WORKSPACES_DIR, roomId).toAbsolutePath().toString();

            // 3. Create the container
            // Use tail -f /dev/null so the container stays alive in the background
            CreateContainerResponse container = dockerClient.createContainerCmd(BASE_IMAGE)
                    .withName("workspace-" + roomId)
                    .withCmd("tail", "-f", "/dev/null")
                    .withWorkingDir("/workspace")
                    // Basic resource limits for security (512MB RAM, 0.5 CPU)
                    .withHostConfig(HostConfig.newHostConfig()
                            .withMemory(512 * 1024 * 1024L)
                            .withCpuQuota(50000L) // 50% of a single core
                            .withCpuPeriod(100000L)
                            .withBinds(new Bind(hostPath, new Volume("/workspace")))
                    )
                    .exec();

            String containerId = container.getId();

            // 3. Start the container
            dockerClient.startContainerCmd(containerId).exec();
            activeWorkspaces.put(roomId, containerId);

            log.info("Started workspace container {} for room {}", containerId, roomId);
            return containerId;

        } catch (Exception e) {
            log.error("Failed to start Docker workspace for room {}: {}", roomId, e.getMessage());
            throw new RuntimeException("Could not provision Cloud IDE Workspace", e);
        }
    }

    public void stopWorkspace(String roomId) {
        String containerId = activeWorkspaces.remove(roomId);
        if (containerId != null) {
            try {
                dockerClient.stopContainerCmd(containerId).withTimeout(5).exec();
                dockerClient.removeContainerCmd(containerId).withForce(true).exec();
                log.info("Stopped and removed workspace container {}", containerId);
            } catch (Exception e) {
                log.warn("Error stopping workspace container {}: {}", containerId, e.getMessage());
            }
        }
    }

    public String getContainerId(String roomId) {
        return activeWorkspaces.get(roomId);
    }

    /**
     * Dumps all files for this room from Postgres to the host filesystem.
     */
    private void syncWorkspaceToHost(String roomId) {
        try {
            Path roomDir = Paths.get(HOST_WORKSPACES_DIR, roomId);
            if (!Files.exists(roomDir)) {
                Files.createDirectories(roomDir);
            }

            roomRepository.findById(UUID.fromString(roomId)).ifPresent(room -> {
                List<File> files = fileRepository.findByRoomAndParentIsNull(room);
                for (File file : files) {
                    writeNodeToDisk(file, roomDir);
                }
            });
            log.info("Synced workspace {} to host disk at {}", roomId, roomDir);
        } catch (IOException e) {
            log.error("Failed to sync workspace {} to disk", roomId, e);
        }
    }

    private void writeNodeToDisk(File file, Path currentPath) {
        try {
            Path nodePath = currentPath.resolve(file.getName());
            if (Boolean.TRUE.equals(file.getIsFolder())) {
                if (!Files.exists(nodePath)) {
                    Files.createDirectories(nodePath);
                }
                List<File> children = fileRepository.findByParent(file);
                for (File child : children) {
                    writeNodeToDisk(child, nodePath);
                }
            } else {
                String content = file.getContent() != null ? file.getContent() : "";
                Files.writeString(nodePath, content);
            }
        } catch (IOException e) {
            log.error("Failed to write file {} to disk", file.getName(), e);
        }
    }
}
