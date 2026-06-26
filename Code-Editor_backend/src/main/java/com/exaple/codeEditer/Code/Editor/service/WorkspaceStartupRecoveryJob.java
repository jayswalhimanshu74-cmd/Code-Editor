package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WorkspaceStartupRecoveryJob {

    private final WorkspaceReconciliationService reconciliationService;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("Application is ready. Initiating startup workspace recovery...");
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                // Introduce a tiny delay to ensure docker network & Traefik are initialized
                Thread.sleep(3000);
                reconciliationService.reconcileAll();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (Exception e) {
                log.error("Failed to run startup workspace recovery job", e);
            }
        });
    }
}
