package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.dto.SystemMetricsDto;
import com.exaple.codeEditer.Code.Editor.service.SystemMetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SystemMetricsService systemMetricsService;

    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemMetricsDto> getSystemMetrics() {
        return ResponseEntity.ok(systemMetricsService.getMetrics());
    }

    private final com.exaple.codeEditer.Code.Editor.repository.UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Value("${admin.bootstrap.secret}")
    private String bootstrapSecret;

    @org.springframework.beans.factory.annotation.Value("${admin.bootstrap.enabled:false}")
    private boolean bootstrapEnabled;

    @org.springframework.web.bind.annotation.PostMapping("/grant-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> grantRole(@org.springframework.web.bind.annotation.RequestParam String email,
            @org.springframework.web.bind.annotation.RequestParam String role) {
        com.exaple.codeEditer.Code.Editor.entity.User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role.toUpperCase();
        }
        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok("Role updated successfully");
    }

    @org.springframework.web.bind.annotation.PostMapping("/bootstrap-first-admin")
    public ResponseEntity<String> bootstrapFirstAdmin(
            @org.springframework.web.bind.annotation.RequestParam String email,
            @org.springframework.web.bind.annotation.RequestParam String secret) {
        
        if (!bootstrapEnabled) {
            return ResponseEntity.status(403).body("Bootstrap process is disabled");
        }
        if (!bootstrapSecret.equals(secret)) {
            return ResponseEntity.status(403).body("Invalid secret");
        }
        if (userRepository.countByRole("ADMIN") > 0) {
            return ResponseEntity.status(403).body("Admin already exists");
        }

        com.exaple.codeEditer.Code.Editor.entity.User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        user.setRole("ROLE_ADMIN");
        userRepository.save(user);
        return ResponseEntity.ok("First admin bootstrapped successfully");
    }
}
