package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.service.GitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/git")
@RequiredArgsConstructor
public class GitController {

    private final GitService gitService;

    @PostMapping("/{roomId}/init")
    @PreAuthorize("hasPermission(#roomId, 'GIT_OPERATIONS')")
    public ResponseEntity<?> initRepository(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean success = gitService.initRepository(roomId);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Repository initialized"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to initialize repository"));
        }
    }

    @GetMapping("/{roomId}/status")
    @PreAuthorize("hasPermission(#roomId, 'GIT_OPERATIONS')")
    public ResponseEntity<?> getStatus(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> status = gitService.getStatus(roomId);
        return ResponseEntity.ok(status);
    }

    @PostMapping("/{roomId}/commit")
    @PreAuthorize("hasPermission(#roomId, 'GIT_OPERATIONS')")
    public ResponseEntity<?> commitChanges(
            @PathVariable String roomId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Commit message is required"));
        }

        String email = userDetails.getUsername();
        String name = email.split("@")[0]; // Fallback name

        boolean success = gitService.commitChanges(roomId, message, name, email);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Changes committed successfully"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to commit changes"));
        }
    }

    @GetMapping("/{roomId}/file/head")
    @PreAuthorize("hasPermission(#roomId, 'GIT_OPERATIONS')")
    public ResponseEntity<String> getFileFromHead(
            @PathVariable String roomId,
            @RequestParam String path,
            @AuthenticationPrincipal UserDetails userDetails) {
        String content = gitService.getFileContentFromHead(roomId, path);
        return ResponseEntity.ok(content);
    }

    @PostMapping("/{roomId}/clone")
    @PreAuthorize("hasPermission(#roomId, 'GIT_OPERATIONS')")
    public ResponseEntity<?> cloneRepository(
            @PathVariable String roomId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        String repoUrl = payload.get("repoUrl");
        if (repoUrl == null || repoUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Repository URL is required"));
        }
        boolean success = gitService.cloneRepository(roomId, repoUrl, userDetails.getUsername());
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Repository cloned successfully"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to clone repository"));
        }
    }

    @PostMapping("/{roomId}/pull")
    @PreAuthorize("hasPermission(#roomId, 'GIT_OPERATIONS')")
    public ResponseEntity<?> pullChanges(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean success = gitService.pullChanges(roomId, userDetails.getUsername());
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Pulled successfully"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to pull changes"));
        }
    }

    @PostMapping("/{roomId}/push")
    @PreAuthorize("hasPermission(#roomId, 'GIT_OPERATIONS')")
    public ResponseEntity<?> pushChanges(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean success = gitService.pushChanges(roomId, userDetails.getUsername());
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Pushed successfully"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to push changes"));
        }
    }

    @GetMapping("/{roomId}/branches")
    @PreAuthorize("hasPermission(#roomId, 'GIT_OPERATIONS')")
    public ResponseEntity<?> listBranches(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<String> branches = gitService.listBranches(roomId);
        return ResponseEntity.ok(branches);
    }

    @PostMapping("/{roomId}/branches/create")
    @PreAuthorize("hasPermission(#roomId, 'GIT_OPERATIONS')")
    public ResponseEntity<?> createBranch(
            @PathVariable String roomId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        String branchName = payload.get("branchName");
        if (branchName == null || branchName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Branch name is required"));
        }
        boolean success = gitService.createBranch(roomId, branchName);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Branch created successfully"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to create branch"));
        }
    }

    @PostMapping("/{roomId}/branches/checkout")
    @PreAuthorize("hasPermission(#roomId, 'GIT_OPERATIONS')")
    public ResponseEntity<?> checkoutBranch(
            @PathVariable String roomId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        String branchName = payload.get("branchName");
        if (branchName == null || branchName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Branch name is required"));
        }
        boolean success = gitService.checkoutBranch(roomId, branchName);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Checked out branch successfully"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to checkout branch"));
        }
    }
}
