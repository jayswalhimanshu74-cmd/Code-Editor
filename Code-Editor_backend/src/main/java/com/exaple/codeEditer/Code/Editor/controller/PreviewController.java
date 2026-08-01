package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.entity.WorkspacePort;
import com.exaple.codeEditer.Code.Editor.service.PreviewService;
import com.exaple.codeEditer.Code.Editor.service.PathSecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/preview")
@RequiredArgsConstructor
@Slf4j
public class PreviewController {

    private final PreviewService previewService;
    private final PathSecurityService pathSecurityService;

    private static final String HOST_WORKSPACES_DIR = System.getProperty("user.dir") + "/cloud-workspaces";

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

    @GetMapping("/{roomId}/ports/{port}/content")
    @PreAuthorize("hasPermission(#roomId, 'PREVIEW_ACCESS')")
    public ResponseEntity<String> getPreviewContent(
            @PathVariable String roomId,
            @PathVariable int port,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (!pathSecurityService.isPathSafe(HOST_WORKSPACES_DIR, roomId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid workspace path access");
            }

            Path workspacePath = Paths.get(HOST_WORKSPACES_DIR, roomId);
            File indexHtml = new File(workspacePath.toFile(), "index.html");
            File indexHtm = new File(workspacePath.toFile(), "index.htm");

            File targetFile = indexHtml.exists() ? indexHtml : (indexHtm.exists() ? indexHtm : null);

            if (targetFile != null && targetFile.exists()) {
                String content = Files.readString(targetFile.toPath());
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.TEXT_HTML);
                return new ResponseEntity<>(content, headers, HttpStatus.OK);
            }

            String fallbackHtml = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>HenceCode Workspace Preview</title>
                        <style>
                            body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                            .card { background: #1e293b; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); text-align: center; max-width: 480px; }
                            h2 { color: #38bdf8; margin-top: 0; }
                            p { color: #94a3b8; font-size: 14px; }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <h2>HenceCode Live Preview</h2>
                            <p>Port %d registered for workspace %s.</p>
                            <p>Create an <code>index.html</code> file in your workspace root to view your live application output.</p>
                        </div>
                    </body>
                    </html>
                    """.formatted(port, roomId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_HTML);
            return new ResponseEntity<>(fallbackHtml, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Failed to render preview for room {} port {}", roomId, port, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error rendering workspace preview");
        }
    }
}
