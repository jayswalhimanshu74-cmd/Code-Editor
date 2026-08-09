package com.exaple.codeEditer.Code.Editor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_logout_at")
    private LocalDateTime lastLogoutAt;

    @Column(name = "role", nullable = false, columnDefinition = "varchar(255) default 'ROLE_USER'")
    @Builder.Default
    private String role = "ROLE_USER";

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, columnDefinition = "varchar(255) default 'LOCAL'")
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "provider_id")
    private String providerId;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private GitHubCredential githubCredential;

    @com.fasterxml.jackson.annotation.JsonIgnore
    public String getGithubAccessToken() {
        return githubCredential != null ? githubCredential.getGithubAccessToken() : null;
    }

    public void setGithubAccessToken(String githubAccessToken) {
        if (githubAccessToken == null) {
            this.githubCredential = null;
            return;
        }
        if (this.githubCredential == null) {
            this.githubCredential = new GitHubCredential();
            this.githubCredential.setUser(this);
        }
        this.githubCredential.setGithubAccessToken(githubAccessToken);
    }

    public String getGithubUsername() {
        return githubCredential != null ? githubCredential.getGithubUsername() : null;
    }

    public void setGithubUsername(String githubUsername) {
        if (githubUsername == null) {
            return;
        }
        if (this.githubCredential == null) {
            this.githubCredential = new GitHubCredential();
            this.githubCredential.setUser(this);
        }
        this.githubCredential.setGithubUsername(githubUsername);
    }
}
