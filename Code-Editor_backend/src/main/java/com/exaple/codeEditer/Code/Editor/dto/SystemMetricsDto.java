package com.exaple.codeEditer.Code.Editor.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SystemMetricsDto {
    private long totalUsers;
    private long totalWorkspaces;
    private long activeWorkspaces;
    
    private double hostTotalMemoryGb;
    private int hostTotalCpuCores;
    private int dockerContainersRunning;
    
    private long redisOpsPerSec;
    private long redisConnectedClients;
    private long redisMemoryUsedBytes;
}
