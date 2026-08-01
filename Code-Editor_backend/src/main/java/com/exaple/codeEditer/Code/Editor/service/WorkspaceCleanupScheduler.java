package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WorkspaceCleanupScheduler {

    private final FilesystemCleanupService filesystemCleanupService;

    // Run every hour: "0 0 * * * *"
    @Scheduled(cron = "0 0 * * * *")
    public void performHourlyCleanup() {
        log.info("Starting hourly workspace filesystem cleanup cycle...");
        try {
            filesystemCleanupService.cleanupOrphanedDirectories();
            log.info("Hourly workspace filesystem cleanup cycle completed successfully.");
        } catch (Exception e) {
            log.error("Error occurred during workspace filesystem cleanup cycle", e);
        }
    }
}
