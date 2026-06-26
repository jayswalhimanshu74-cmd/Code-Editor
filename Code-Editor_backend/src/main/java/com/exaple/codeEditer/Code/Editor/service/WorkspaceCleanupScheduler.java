package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WorkspaceCleanupScheduler {

    private final ContainerCleanupService containerCleanupService;
    private final VolumeCleanupService volumeCleanupService;
    private final PreviewCleanupService previewCleanupService;
    private final FilesystemCleanupService filesystemCleanupService;

    // Run every hour: "0 0 * * * *"
    @Scheduled(cron = "0 0 * * * *")
    public void performHourlyCleanup() {
        log.info("Starting hourly enterprise workspace cleanup cycle...");
        try {
            // 1. Stop and remove abandoned and orphaned containers
            containerCleanupService.cleanupAbandonedContainers();

            // 2. Prune unused docker volumes
            volumeCleanupService.cleanupOrphanedVolumes();

            // 3. Remove stale Traefik routing files
            previewCleanupService.cleanupStalePreviews();

            // 4. Clean up host filesystem directories of deleted workspaces
            filesystemCleanupService.cleanupOrphanedDirectories();

            log.info("Hourly enterprise workspace cleanup cycle completed successfully.");
        } catch (Exception e) {
            log.error("Error occurred during workspace cleanup cycle", e);
        }
    }
}
