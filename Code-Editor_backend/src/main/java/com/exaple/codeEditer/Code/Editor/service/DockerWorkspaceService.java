package com.exaple.codeEditer.Code.Editor.service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.model.HostConfig;
import com.github.dockerjava.api.model.Bind;
import com.github.dockerjava.api.model.Volume;
import com.github.dockerjava.api.model.ExposedPort;
import com.github.dockerjava.api.model.Ports;
import com.github.dockerjava.api.command.InspectContainerResponse;
import com.exaple.codeEditer.Code.Editor.entity.File;
import com.exaple.codeEditer.Code.Editor.repository.FileRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import com.exaple.codeEditer.Code.Editor.repository.WorkspaceRepository;
import com.github.dockerjava.api.model.Frame;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class DockerWorkspaceService {

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private DockerClient dockerClient;
    private final FileRepository fileRepository;
    private final RoomRepository roomRepository;
    private final WorkspaceRepository workspaceRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Map Room ID to Docker Container ID
    private final Map<String, String> activeWorkspaces = new ConcurrentHashMap<>();

    private static final String BASE_IMAGE = "cloud-ide-workspace:latest";
    private static final String HOST_WORKSPACES_DIR = System.getProperty("user.dir") + "/cloud-workspaces";
    private static final String DOCKERFILE_PATH = System.getProperty("user.dir")
            + "/src/main/resources/workspace-image";

    /**
     * Spins up an isolated Linux container for the workspace.
     * 
     * @param roomId The UUID of the room/workspace
     * @return The ID of the created Docker container
     */
    public synchronized String provisionContainer(String roomId) {
        if (activeWorkspaces.containsKey(roomId)) {
            return activeWorkspaces.get(roomId);
        }

        try {
            // 1. Ensure image exists (build if necessary)
            try {
                dockerClient.inspectImageCmd(BASE_IMAGE).exec();
            } catch (Exception e) {
                log.info("Building custom base image {}... this may take a few minutes.", BASE_IMAGE);
                java.io.File dockerfileDir = new java.io.File(DOCKERFILE_PATH);
                if (!dockerfileDir.exists()) {
                    throw new RuntimeException("Dockerfile directory not found at " + DOCKERFILE_PATH);
                }
                dockerClient.buildImageCmd(dockerfileDir)
                        .withTags(java.util.Collections.singleton(BASE_IMAGE))
                        .start()
                        .awaitCompletion();
                log.info("Successfully built custom image {}", BASE_IMAGE);
            }

            // 2. Sync database files to host filesystem
            syncWorkspaceToHost(roomId);
            String hostPath = Paths.get(HOST_WORKSPACES_DIR, roomId).toAbsolutePath().toString();

            String containerName = "workspace-" + roomId;

            // 3. Cleanup orphaned container if backend restarted abruptly
            try {
                dockerClient.removeContainerCmd(containerName).withForce(true).exec();
                log.info("Cleaned up orphaned container {}", containerName);
            } catch (Exception ignored) {
                // Container does not exist, safe to proceed
            }

            // 4. Create the container
            // Pre-expose common development ports (3000, 5000, 5173, 8000, 8080)
            List<ExposedPort> exposedPorts = Arrays.asList(
                    ExposedPort.tcp(3000), ExposedPort.tcp(5000), ExposedPort.tcp(5173),
                    ExposedPort.tcp(8000), ExposedPort.tcp(8080));

            Ports portBindings = new Ports();
            for (ExposedPort port : exposedPorts) {
                // Bind to 0 to dynamically allocate an available host port
                portBindings.bind(port, Ports.Binding.bindIp("0.0.0.0"));
            }

            // Use tail -f /dev/null so the container stays alive in the background
            CreateContainerResponse container = dockerClient.createContainerCmd(BASE_IMAGE)
                    .withName(containerName)
                    .withCmd("tail", "-f", "/dev/null")
                    .withWorkingDir("/workspace")
                    .withExposedPorts(exposedPorts)
                    // Basic resource limits for security (512MB RAM, 0.5 CPU)
                    .withHostConfig(HostConfig.newHostConfig()
                            .withMemory(512 * 1024 * 1024L)
                            .withCpuQuota(50000L) // 50% of a single core
                            .withCpuPeriod(100000L)
                            .withBinds(new Bind(hostPath, new Volume("/workspace")))
                            .withPortBindings(portBindings))
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

    public void stopAndRemoveContainer(String containerId, String roomId) {
        if (containerId != null) {
            try {
                dockerClient.stopContainerCmd(containerId).withTimeout(5).exec();
                dockerClient.removeContainerCmd(containerId).withForce(true).exec();
                activeWorkspaces.remove(roomId);
                log.info("Stopped and removed workspace container {}", containerId);
            } catch (Exception e) {
                log.warn("Error stopping workspace container {}: {}", containerId, e.getMessage());
            }
        }
    }

    public boolean isContainerRunning(String containerId) {
        if (containerId == null)
            return false;
        try {
            com.github.dockerjava.api.command.InspectContainerResponse response = dockerClient
                    .inspectContainerCmd(containerId).exec();
            return Boolean.TRUE.equals(response.getState().getRunning());
        } catch (Exception e) {
            return false;
        }
    }

    public void cleanupOrphanedContainers(List<String> validContainerIds) {
        try {
            List<com.github.dockerjava.api.model.Container> containers = dockerClient.listContainersCmd()
                    .withShowAll(true)
                    .exec();

            for (com.github.dockerjava.api.model.Container c : containers) {
                if (c.getNames().length > 0 && c.getNames()[0].startsWith("/workspace-")) {
                    if (!validContainerIds.contains(c.getId())) {
                        log.info("Removing orphaned workspace container {}", c.getId());
                        try {
                            dockerClient.removeContainerCmd(c.getId()).withForce(true).exec();
                        } catch (Exception e) {
                            log.warn("Failed to remove orphaned container {}", c.getId());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Skipping orphaned container cleanup: Docker is not reachable.");
        }
    }

    public String getContainerId(String roomId) {
        String fromMap = activeWorkspaces.get(roomId);
        if (fromMap != null) return fromMap;
        return workspaceRepository.findById(roomId)
            .map(com.exaple.codeEditer.Code.Editor.entity.WorkspaceEntity::getContainerId)
            .orElse(null);
    }

    /**
     * Inspects the running container and returns the dynamically assigned host port
     * for the requested container port.
     */
    public Integer getMappedHostPort(String roomId, int containerPort) {
        String containerId = getContainerId(roomId);
        if (containerId == null) {
            return null;
        }
        try {
            InspectContainerResponse inspect = dockerClient.inspectContainerCmd(containerId).exec();
            Ports ports = inspect.getNetworkSettings().getPorts();
            if (ports != null) {
                Ports.Binding[] bindings = ports.getBindings().get(ExposedPort.tcp(containerPort));
                if (bindings != null && bindings.length > 0) {
                    return Integer.parseInt(bindings[0].getHostPortSpec());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to get mapped port for room {}: {}", roomId, e.getMessage());
        }
        return null;
    }

    /**
     * Dumps all files for this room from Postgres to the host filesystem.
     */
    public void syncWorkspaceToHost(String roomId) {
        try {
            Path roomDir = Paths.get(HOST_WORKSPACES_DIR, roomId);
            if (!Files.exists(roomDir)) {
                Files.createDirectories(roomDir);
            }

            roomRepository.findById(UUID.fromString(roomId)).ifPresent(room -> {
                List<File> allFiles = fileRepository.findByRoom(room);
                Map<UUID, List<File>> childMap = allFiles.stream()
                        .filter(f -> f.getParent() != null)
                        .collect(java.util.stream.Collectors.groupingBy(f -> f.getParent().getId()));
                List<File> roots = allFiles.stream()
                        .filter(f -> f.getParent() == null)
                        .toList();
                for (File file : roots) {
                    writeNodeToDisk(file, roomDir, childMap);
                }
            });
            log.info("Synced workspace {} to host disk at {}", roomId, roomDir);
        } catch (IOException e) {
            log.error("Failed to sync workspace {} to disk", roomId, e);
        }
    }

    private void writeNodeToDisk(File file, Path currentPath, Map<UUID, List<File>> childMap) {
        try {
            Path nodePath = currentPath.resolve(file.getName());
            if (Boolean.TRUE.equals(file.getIsFolder())) {
                if (!Files.exists(nodePath)) {
                    Files.createDirectories(nodePath);
                }
                List<File> children = childMap.getOrDefault(file.getId(), java.util.Collections.emptyList());
                for (File child : children) {
                    writeNodeToDisk(child, nodePath, childMap);
                }
            } else {
                String content = file.getContent() != null ? file.getContent() : "";
                Files.writeString(nodePath, content);
            }
        } catch (IOException e) {
            log.error("Failed to write file {} to disk", file.getName(), e);
        }
    }

    public com.exaple.codeEditer.Code.Editor.dto.ContainerMetrics getContainerMetrics(String roomId) {
        String containerId = getContainerId(roomId);
        if (containerId == null) {
            return new com.exaple.codeEditer.Code.Editor.dto.ContainerMetrics(0.0, 0.0, 512.0);
        }

        try {
            java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(1);
            java.util.concurrent.atomic.AtomicReference<com.github.dockerjava.api.model.Statistics> statsRef = new java.util.concurrent.atomic.AtomicReference<>();

            dockerClient.statsCmd(containerId)
                    .withNoStream(true)
                    .exec(new com.github.dockerjava.api.async.ResultCallback.Adapter<com.github.dockerjava.api.model.Statistics>() {
                        @Override
                        public void onNext(com.github.dockerjava.api.model.Statistics stats) {
                            statsRef.set(stats);
                            latch.countDown();
                        }
                    });

            latch.await(2, java.util.concurrent.TimeUnit.SECONDS);
            com.github.dockerjava.api.model.Statistics stats = statsRef.get();

            if (stats == null || stats.getCpuStats() == null || stats.getMemoryStats() == null) {
                return new com.exaple.codeEditer.Code.Editor.dto.ContainerMetrics(0.0, 0.0, 512.0);
            }

            // CPU calculation
            double cpuPercent = 0.0;
            Long cpuDelta = stats.getCpuStats().getCpuUsage().getTotalUsage()
                    - stats.getPreCpuStats().getCpuUsage().getTotalUsage();
            Long systemCpuDelta = stats.getCpuStats().getSystemCpuUsage() - stats.getPreCpuStats().getSystemCpuUsage();

            if (systemCpuDelta > 0.0 && cpuDelta > 0.0) {
                int onlineCpus = stats.getCpuStats().getOnlineCpus() != null
                        ? stats.getCpuStats().getOnlineCpus().intValue()
                        : 1;
                cpuPercent = ((double) cpuDelta / (double) systemCpuDelta) * onlineCpus * 100.0;
            }

            // Memory calculation
            Long usage = stats.getMemoryStats().getUsage();
            Long limit = stats.getMemoryStats().getLimit();

            // Docker memory usage
            double memUsageMb = usage / (1024.0 * 1024.0);
            double memLimitMb = limit / (1024.0 * 1024.0);

            return new com.exaple.codeEditer.Code.Editor.dto.ContainerMetrics(
                    Math.round(cpuPercent * 100.0) / 100.0,
                    Math.round(memUsageMb * 100.0) / 100.0,
                    Math.round(memLimitMb * 100.0) / 100.0);

        } catch (Exception e) {
            log.warn("Failed to fetch metrics for room {}: {}", roomId, e.getMessage());
            return new com.exaple.codeEditer.Code.Editor.dto.ContainerMetrics(0.0, 0.0, 512.0);
        }
    }

    @Deprecated
    public void executeCommandStream(String roomId, String cmd, String workingDir, String execId) {
        throw new UnsupportedOperationException(
            "executeCommandStream is deprecated. Use runEphemeralSandbox for sandboxed code execution " +
            "or connect via TerminalWebSocketHandler for interactive terminal access."
        );
    }

    public int runEphemeralSandbox(String roomId, String execId, String cmd, StringBuilder fullOutput) {
        String hostPath = Paths.get(HOST_WORKSPACES_DIR, roomId).toAbsolutePath().toString();
        String safeCmd = "timeout -k 2s 14s bash -c '" + cmd.replace("'", "'\\''") + "'";

        try {
            // 1. Create container
            com.github.dockerjava.api.command.CreateContainerResponse container = dockerClient
                    .createContainerCmd(BASE_IMAGE)
                    .withCmd("/bin/bash", "-c", safeCmd)
                    .withWorkingDir("/workspace")
                    .withHostConfig(com.github.dockerjava.api.model.HostConfig.newHostConfig()
                            .withMemory(512 * 1024 * 1024L) // 512MB limit for execution sandbox (Java needs more RAM)
                            .withCpuQuota(50000L) // 50% CPU
                            .withCpuPeriod(100000L)
                            .withBinds(new com.github.dockerjava.api.model.Bind(hostPath,
                                    new com.github.dockerjava.api.model.Volume("/workspace")))
                            .withNetworkMode("none")) // Disable networking for security
                    .exec();

            // 2. Attach Wait callback BEFORE starting to avoid missing fast exits
            com.github.dockerjava.api.command.WaitContainerResultCallback waitCb = new com.github.dockerjava.api.command.WaitContainerResultCallback();
            dockerClient.waitContainerCmd(container.getId()).exec(waitCb);

            // 3. Start container
            dockerClient.startContainerCmd(container.getId()).exec();

            // 4. Attach Log callback AFTER starting, otherwise docker-java sees it's not running and closes instantly
            com.github.dockerjava.api.async.ResultCallbackTemplate<com.github.dockerjava.api.async.ResultCallback<Frame>, Frame> logCallback = 
                dockerClient.logContainerCmd(container.getId())
                    .withStdOut(true)
                    .withStdErr(true)
                    .withFollowStream(true)
                    .withTailAll() // Ensure we get logs from the very beginning
                    .exec(new com.github.dockerjava.api.async.ResultCallbackTemplate<com.github.dockerjava.api.async.ResultCallback<Frame>, Frame>() {
                        @Override
                        public void onNext(Frame item) {
                            String type = item.getStreamType().name().toLowerCase();
                            String data = new String(item.getPayload(), java.nio.charset.StandardCharsets.UTF_8);
                            fullOutput.append(data);
                            sendExecutionMessage(roomId, execId, type, data);
                        }
                    });

            // 5. Await exit
            int exitCode = -1;
            try {
                // Await container exit instead of log stream
                exitCode = waitCb.awaitStatusCode(15, java.util.concurrent.TimeUnit.SECONDS);
                
                // Allow the log stream to finish flushing after container stops
                try { logCallback.awaitCompletion(2, java.util.concurrent.TimeUnit.SECONDS); } catch(Exception ignored) {}

                // GUARANTEE: Fetch all logs synchronously after exit to catch any dropped frames
                StringBuilder finalLogs = new StringBuilder();
                try {
                    dockerClient.logContainerCmd(container.getId())
                        .withStdOut(true)
                        .withStdErr(true)
                        .withTailAll()
                        .withFollowStream(true)
                        .exec(new com.github.dockerjava.api.async.ResultCallbackTemplate<com.github.dockerjava.api.async.ResultCallback<Frame>, Frame>() {
                            @Override
                            public void onNext(Frame item) {
                                finalLogs.append(new String(item.getPayload(), java.nio.charset.StandardCharsets.UTF_8));
                            }
                        }).awaitCompletion(3, java.util.concurrent.TimeUnit.SECONDS);
                    
                    if (finalLogs.length() > fullOutput.length()) {
                        String missing = finalLogs.substring(fullOutput.length());
                        fullOutput.append(missing);
                        sendExecutionMessage(roomId, execId, "stdout", missing);
                    }
                } catch (Exception ignored) {}

            } catch (Exception e) {
                // Timeout or error during wait
            } finally {
                // Cleanup stream and container
                try { logCallback.close(); } catch(Exception ignored) {}
                try { dockerClient.removeContainerCmd(container.getId()).withForce(true).exec(); } catch(Exception ignored) {}
            }

            sendExecutionMessage(roomId, execId, "system", "\n[Process Exited]");
            return exitCode;
        } catch (Exception e) {
            sendExecutionMessage(roomId, execId, "error", "\n[Execution Error: " + e.getMessage() + "]");
            return -1;
        }
    }

    private void sendExecutionMessage(String roomId, String execId, String type, String data) {
        java.util.Map<String, String> payload = new java.util.HashMap<>();
        payload.put("execId", execId);
        payload.put("type", type);
        payload.put("data", data);
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/execution", payload);
    }
}
