package com.exaple.codeEditer.Code.Editor.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class VolumeCleanupService {

    public void cleanupOrphanedVolumes() {
        log.info("Running Docker volume pruning sweep...");
        try {
            Process process = Runtime.getRuntime().exec(new String[]{"docker", "volume", "prune", "-f"});
            process.waitFor();
            log.info("Successfully pruned unused Docker volumes.");
        } catch (Exception e) {
            log.warn("Failed to prune Docker volumes: {}", e.getMessage());
        }
    }
}
