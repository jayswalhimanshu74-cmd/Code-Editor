package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.entity.CodeSnapshot;
import com.exaple.codeEditer.Code.Editor.entity.File;
import com.exaple.codeEditer.Code.Editor.service.SnapshotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{roomId}/files/{fileId}/snapshots")
@RequiredArgsConstructor
public class SnapshotController {

    private final SnapshotService snapshotService;

    // ── POST /api/rooms/{roomId}/files/{fileId}/snapshots ─────────────────────
    @PostMapping
    public ResponseEntity<CodeSnapshot> saveSnapshot(
            @PathVariable UUID roomId,
            @PathVariable UUID fileId,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String label = body != null ? body.get("label") : "snapshot";
        CodeSnapshot snapshot = snapshotService.saveSnapshot(
                roomId, fileId, userDetails.getUsername(), label);
        return ResponseEntity.ok(snapshot);
    }

    // ── GET /api/rooms/{roomId}/files/{fileId}/snapshots ──────────────────────
    @GetMapping
    public ResponseEntity<List<CodeSnapshot>> getSnapshots(
            @PathVariable UUID roomId,
            @PathVariable UUID fileId,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<CodeSnapshot> snapshots = snapshotService.getSnapshots(
                roomId, fileId, userDetails.getUsername());
        return ResponseEntity.ok(snapshots);
    }

    // ── POST /api/rooms/{roomId}/files/{fileId}/snapshots/{snapshotId}/restore ─
    @PostMapping("/{snapshotId}/restore")
    public ResponseEntity<File> restoreSnapshot(
            @PathVariable UUID roomId,
            @PathVariable UUID fileId,
            @PathVariable UUID snapshotId,
            @AuthenticationPrincipal UserDetails userDetails) {

        File file = snapshotService.restoreSnapshot(
                roomId, snapshotId, userDetails.getUsername());
        return ResponseEntity.ok(file);
    }

    // ── DELETE /api/rooms/{roomId}/files/{fileId}/snapshots/{snapshotId} ──────
    @DeleteMapping("/{snapshotId}")
    public ResponseEntity<Void> deleteSnapshot(
            @PathVariable UUID roomId,
            @PathVariable UUID fileId,
            @PathVariable UUID snapshotId,
            @AuthenticationPrincipal UserDetails userDetails) {

        snapshotService.deleteSnapshot(roomId, snapshotId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}