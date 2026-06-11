package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.entity.WorkspaceSnapshot;
import com.exaple.codeEditer.Code.Editor.service.WorkspaceSnapshotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/snapshots")
@RequiredArgsConstructor
public class WorkspaceSnapshotController {

    private final WorkspaceSnapshotService workspaceSnapshotService;

    @PostMapping
    public ResponseEntity<WorkspaceSnapshot> createSnapshot(
            @PathVariable String workspaceId,
            @RequestBody Map<String, String> request) {
        String name = request.get("name");
        String description = request.get("description");
        WorkspaceSnapshot snapshot = workspaceSnapshotService.createSnapshot(workspaceId, name, description);
        return ResponseEntity.ok(snapshot);
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceSnapshot>> listSnapshots(@PathVariable String workspaceId) {
        return ResponseEntity.ok(workspaceSnapshotService.listSnapshots(workspaceId));
    }

    @PostMapping("/{snapshotId}/restore")
    public ResponseEntity<WorkspaceSnapshot> restoreSnapshot(
            @PathVariable String workspaceId,
            @PathVariable String snapshotId) {
        WorkspaceSnapshot restored = workspaceSnapshotService.restoreSnapshot(workspaceId, snapshotId);
        return ResponseEntity.ok(restored);
    }

    @DeleteMapping("/{snapshotId}")
    public ResponseEntity<Void> deleteSnapshot(
            @PathVariable String workspaceId,
            @PathVariable String snapshotId) {
        workspaceSnapshotService.deleteSnapshot(snapshotId);
        return ResponseEntity.ok().build();
    }
}
