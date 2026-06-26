package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.entity.WorkspacePort;
import com.exaple.codeEditer.Code.Editor.service.PreviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/preview")
@RequiredArgsConstructor
public class PreviewController {

    private final PreviewService previewService;

    @PostMapping("/{roomId}/ports/{port}")
    @PreAuthorize("hasPermission(#roomId, 'PREVIEW_ACCESS')")
    public ResponseEntity<?> registerPort(
            @PathVariable String roomId,
            @PathVariable int port,
            @AuthenticationPrincipal UserDetails userDetails) {
        String previewUrl = previewService.registerPort(roomId, port);
        return ResponseEntity.ok(Map.of("url", previewUrl, "port", port));
    }

    @GetMapping("/{roomId}/ports")
    @PreAuthorize("hasPermission(#roomId, 'PREVIEW_ACCESS')")
    public ResponseEntity<List<WorkspacePort>> getRegisteredPorts(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(previewService.getRegisteredPorts(roomId));
    }
}
