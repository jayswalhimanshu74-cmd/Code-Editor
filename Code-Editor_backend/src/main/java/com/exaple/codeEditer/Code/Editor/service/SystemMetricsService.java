package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.dto.SystemMetricsDto;
import com.exaple.codeEditer.Code.Editor.entity.WorkspaceEntity;
import com.exaple.codeEditer.Code.Editor.entity.WorkspaceStatus;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import com.exaple.codeEditer.Code.Editor.repository.WorkspaceRepository;
import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.model.Info;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemMetricsService {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final DockerClient dockerClient;
    private final RedisTemplate<String, Object> redisTemplate;

    public SystemMetricsDto getMetrics() {
        long totalUsers = userRepository.count();
        long totalWorkspaces = workspaceRepository.count();
        long activeWorkspaces = workspaceRepository.countByStatus(WorkspaceStatus.RUNNING);

        double memoryGb = 0.0;
        int cpuCores = 0;
        int dockerRunning = 0;

        try {
            Info info = dockerClient.infoCmd().exec();
            Long memTotal = info.getMemTotal();
            if (memTotal != null) {
                memoryGb = memTotal / (1024.0 * 1024.0 * 1024.0);
            }
            Integer ncpu = info.getNCPU();
            if (ncpu != null) {
                cpuCores = ncpu;
            }
            Integer containersRunning = info.getContainersRunning();
            if (containersRunning != null) {
                dockerRunning = containersRunning;
            }
        } catch (Exception e) {
            log.warn("Failed to fetch Docker info: {}", e.getMessage());
        }

        long opsPerSec = 0;
        long connectedClients = 0;
        long memoryUsed = 0;

        try {
            Properties stats = redisTemplate.getConnectionFactory().getConnection().info("stats");
            if (stats != null) {
                String ops = stats.getProperty("instantaneous_ops_per_sec");
                if (ops != null) opsPerSec = Long.parseLong(ops);
            }

            Properties clients = redisTemplate.getConnectionFactory().getConnection().info("clients");
            if (clients != null) {
                String connected = clients.getProperty("connected_clients");
                if (connected != null) connectedClients = Long.parseLong(connected);
            }

            Properties memory = redisTemplate.getConnectionFactory().getConnection().info("memory");
            if (memory != null) {
                String used = memory.getProperty("used_memory");
                if (used != null) memoryUsed = Long.parseLong(used);
            }
        } catch (Exception e) {
            log.warn("Failed to fetch Redis info: {}", e.getMessage());
        }

        return SystemMetricsDto.builder()
                .totalUsers(totalUsers)
                .totalWorkspaces(totalWorkspaces)
                .activeWorkspaces(activeWorkspaces)
                .hostTotalMemoryGb(memoryGb)
                .hostTotalCpuCores(cpuCores)
                .dockerContainersRunning(dockerRunning)
                .redisOpsPerSec(opsPerSec)
                .redisConnectedClients(connectedClients)
                .redisMemoryUsedBytes(memoryUsed)
                .build();
    }
}
