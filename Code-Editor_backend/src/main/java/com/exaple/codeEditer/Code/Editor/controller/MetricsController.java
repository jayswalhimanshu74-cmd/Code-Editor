package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.dto.ContainerMetrics;
import com.exaple.codeEditer.Code.Editor.service.DockerWorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private final DockerWorkspaceService dockerWorkspaceService;

    @GetMapping("/{roomId}")
    @PreAuthorize("hasPermission(#roomId, 'PREVIEW_ACCESS')")
    public ResponseEntity<ContainerMetrics> getMetrics(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        ContainerMetrics metrics = dockerWorkspaceService.getContainerMetrics(roomId);
        return ResponseEntity.ok(metrics);
    }
}
