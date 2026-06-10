package com.exaple.codeEditer.Code.Editor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContainerMetrics {
    private Double cpuPercentage;
    private Double memoryUsageMb;
    private Double memoryLimitMb;
}
