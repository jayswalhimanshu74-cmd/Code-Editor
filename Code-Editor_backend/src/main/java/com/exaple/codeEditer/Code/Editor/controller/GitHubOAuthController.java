package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.service.GitHubService;
import com.exaple.codeEditer.Code.Editor.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
public class GitHubOAuthController {

    private final GitHubService gitHubService;
    private final UserService userService;

    @Value("${github.client.id:}")
    private String clientId;

    @GetMapping("/client-id")
    public ResponseEntity<Map<String, String>> getClientId() {
        Map<String, String> response = new HashMap<>();
        response.put("clientId", clientId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/callback")
    public ResponseEntity<?> handleGitHubCallback(@RequestBody Map<String, String> payload,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        String code = payload.get("code");
        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Authorization code is required"));
        }

        try {
            User user = userService.getUserByEmail(userDetails.getUsername());
            gitHubService.exchangeCodeForToken(user, code);
            return ResponseEntity.ok(Map.of("message", "GitHub connected successfully", "githubUsername", user.getGithubUsername()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/repos")
    public ResponseEntity<?> getRepositories(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.getUserByEmail(userDetails.getUsername());
            List<Map<String, Object>> repos = gitHubService.getUserRepositories(user);
            return ResponseEntity.ok(repos);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/disconnect")
    public ResponseEntity<?> disconnectGitHub(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.getUserByEmail(userDetails.getUsername());
            gitHubService.disconnectGitHub(user);
            return ResponseEntity.ok(Map.of("message", "GitHub disconnected"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
