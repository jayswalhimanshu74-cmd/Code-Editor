package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.entity.WorkspaceSnapshot;
import com.exaple.codeEditer.Code.Editor.service.WorkspaceSnapshotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/snapshots")
@RequiredArgsConstructor
public class WorkspaceSnapshotController {

    private final WorkspaceSnapshotService workspaceSnapshotService;

    @PostMapping
    @PreAuthorize("hasPermission(#workspaceId, 'WORKSPACE_EDIT')")
    public ResponseEntity<WorkspaceSnapshot> createSnapshot(
            @PathVariable String workspaceId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String name = request.get("name");
        String description = request.get("description");
        WorkspaceSnapshot snapshot = workspaceSnapshotService.createSnapshot(workspaceId, name, description);
        return ResponseEntity.ok(snapshot);
    }

    @GetMapping
    @PreAuthorize("hasPermission(#workspaceId, 'PREVIEW_ACCESS')")
    public ResponseEntity<List<WorkspaceSnapshot>> listSnapshots(
            @PathVariable String workspaceId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(workspaceSnapshotService.listSnapshots(workspaceId));
    }

    @PostMapping("/{snapshotId}/restore")
    @PreAuthorize("hasPermission(#workspaceId, 'WORKSPACE_MANAGE')")
    public ResponseEntity<WorkspaceSnapshot> restoreSnapshot(
            @PathVariable String workspaceId,
            @PathVariable String snapshotId,
            @AuthenticationPrincipal UserDetails userDetails) {
        WorkspaceSnapshot restored = workspaceSnapshotService.restoreSnapshot(workspaceId, snapshotId);
        return ResponseEntity.ok(restored);
    }

    @DeleteMapping("/{snapshotId}")
    @PreAuthorize("hasPermission(#workspaceId, 'WORKSPACE_MANAGE')")
    public ResponseEntity<Void> deleteSnapshot(
            @PathVariable String workspaceId,
            @PathVariable String snapshotId,
            @AuthenticationPrincipal UserDetails userDetails) {
        workspaceSnapshotService.deleteSnapshot(snapshotId);
        return ResponseEntity.ok().build();
    }
}
