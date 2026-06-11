package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.entity.WorkspacePort;
import com.exaple.codeEditer.Code.Editor.service.PreviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/preview")
@RequiredArgsConstructor
public class PreviewController {

    private final PreviewService previewService;

    @PostMapping("/{roomId}/ports/{port}")
    public ResponseEntity<?> registerPort(@PathVariable String roomId, @PathVariable int port) {
        String previewUrl = previewService.registerPort(roomId, port);
        return ResponseEntity.ok(Map.of("url", previewUrl, "port", port));
    }

    @GetMapping("/{roomId}/ports")
    public ResponseEntity<List<WorkspacePort>> getRegisteredPorts(@PathVariable String roomId) {
        return ResponseEntity.ok(previewService.getRegisteredPorts(roomId));
    }
}
