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
    private final org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;

    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String clientId;

    @GetMapping("/client-id")
    public ResponseEntity<Map<String, String>> getClientId() {
        Map<String, String> response = new HashMap<>();
        response.put("clientId", clientId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/authorize")
    public ResponseEntity<Map<String, String>> getAuthorizeUrl(@AuthenticationPrincipal UserDetails userDetails) {
        String state = java.util.UUID.randomUUID().toString();
        String email = userDetails.getUsername();
        stringRedisTemplate.opsForValue().set("github:oauth:state:" + state, email, java.time.Duration.ofMinutes(5));
        
        String authorizeUrl = "https://github.com/login/oauth/authorize" +
                "?client_id=" + clientId +
                "&scope=repo,user:email" +
                "&state=" + state;
                
        return ResponseEntity.ok(Map.of("url", authorizeUrl));
    }

    @PostMapping("/callback")
    public ResponseEntity<?> handleGitHubCallback(@RequestBody Map<String, String> payload,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        String code = payload.get("code");
        String state = payload.get("state");
        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Authorization code is required"));
        }
        if (state == null || state.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "State parameter is required"));
        }

        String key = "github:oauth:state:" + state;
        String storedEmail = stringRedisTemplate.opsForValue().get(key);
        if (storedEmail == null || !storedEmail.equals(userDetails.getUsername())) {
            return ResponseEntity.status(403).body(Map.of("error", "Invalid or expired state parameter. CSRF attempt blocked."));
        }
        stringRedisTemplate.delete(key);

        try {
            User user = userService.getUserByEmail(userDetails.getUsername());
            gitHubService.exchangeCodeForToken(user, code);
            return ResponseEntity.ok(Map.of("message", "GitHub connected successfully", "githubUsername", user.getGithubUsername()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/repos/create")
    public ResponseEntity<?> createRepository(@RequestBody Map<String, Object> payload,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        String name = (String) payload.get("name");
        String description = (String) payload.get("description");
        Boolean isPrivate = (Boolean) payload.get("private");
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Repository name is required"));
        }
        if (isPrivate == null) {
            isPrivate = false;
        }

        try {
            User user = userService.getUserByEmail(userDetails.getUsername());
            Map<String, Object> result = gitHubService.createRepository(user, name, description, isPrivate);
            return ResponseEntity.ok(result);
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
