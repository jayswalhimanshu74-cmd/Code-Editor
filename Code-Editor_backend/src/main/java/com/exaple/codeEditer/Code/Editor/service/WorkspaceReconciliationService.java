package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.WorkspaceEntity;
import com.exaple.codeEditer.Code.Editor.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceReconciliationService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceRecoveryService workspaceRecoveryService;

    public void reconcileAll() {
        log.info("Starting workspace reconciliation sweep...");
        try {
            List<WorkspaceEntity> workspaces = workspaceRepository.findAll();
            for (WorkspaceEntity ws : workspaces) {
                workspaceRecoveryService.recoverWorkspace(ws.getId());
            }
            log.info("Workspace reconciliation sweep completed.");
        } catch (Exception e) {
            log.error("Error during workspace reconciliation sweep", e);
        }
    }
}
