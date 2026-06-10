package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.service.GitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/git")
@RequiredArgsConstructor
public class GitController {

    private final GitService gitService;

    @PostMapping("/{roomId}/init")
    public ResponseEntity<?> initRepository(@PathVariable String roomId) {
        boolean success = gitService.initRepository(roomId);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Repository initialized"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to initialize repository"));
        }
    }

    @GetMapping("/{roomId}/status")
    public ResponseEntity<?> getStatus(@PathVariable String roomId) {
        Map<String, Object> status = gitService.getStatus(roomId);
        return ResponseEntity.ok(status);
    }

    @PostMapping("/{roomId}/commit")
    public ResponseEntity<?> commitChanges(@PathVariable String roomId,
                                           @RequestBody Map<String, String> payload,
                                           Principal principal) {
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Commit message is required"));
        }

        // Use Principal's name/email as author (we can extract email if it's stored in Principal)
        String email = principal != null ? principal.getName() : "user@cloudide.com";
        String name = email.split("@")[0]; // Fallback name

        boolean success = gitService.commitChanges(roomId, message, name, email);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Changes committed successfully"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to commit changes"));
        }
    }
     @GetMapping("/{roomId}/file/head")
    public ResponseEntity<String> getFileFromHead(@PathVariable String roomId,
                                                  @RequestParam String path) {
        String content = gitService.getFileContentFromHead(roomId, path);
        return ResponseEntity.ok(content);
                                                                          
    }              
      }
