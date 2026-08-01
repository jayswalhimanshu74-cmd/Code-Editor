package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.dto.SystemMetricsDto;
import com.exaple.codeEditer.Code.Editor.entity.WorkspaceStatus;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import com.exaple.codeEditer.Code.Editor.repository.WorkspaceRepository;
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
    private final RedisTemplate<String, Object> redisTemplate;

    public SystemMetricsDto getMetrics() {
        long totalUsers = userRepository.count();
        long totalWorkspaces = workspaceRepository.count();
        long activeWorkspaces = workspaceRepository.countByStatus(WorkspaceStatus.RUNNING);

        Runtime runtime = Runtime.getRuntime();
        double memoryGb = runtime.maxMemory() / (1024.0 * 1024.0 * 1024.0);
        int cpuCores = runtime.availableProcessors();
        int activeWorkspacesCount = (int) activeWorkspaces;

        long opsPerSec = 0;
        long connectedClients = 0;
        long memoryUsed = 0;

        try (org.springframework.data.redis.connection.RedisConnection connection = redisTemplate.getConnectionFactory().getConnection()) {
            Properties stats = connection.info("stats");
            if (stats != null) {
                String ops = stats.getProperty("instantaneous_ops_per_sec");
                if (ops != null) opsPerSec = Long.parseLong(ops);
            }

            Properties clients = connection.info("clients");
            if (clients != null) {
                String connected = clients.getProperty("connected_clients");
                if (connected != null) connectedClients = Long.parseLong(connected);
            }

            Properties memory = connection.info("memory");
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
                .dockerContainersRunning(activeWorkspacesCount)
                .redisOpsPerSec(opsPerSec)
                .redisConnectedClients(connectedClients)
                .redisMemoryUsedBytes(memoryUsed)
                .build();
    }
}
