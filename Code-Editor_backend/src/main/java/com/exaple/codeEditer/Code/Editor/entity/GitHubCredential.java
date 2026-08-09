package com.exaple.codeEditer.Code.Editor.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "github_credentials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GitHubCredential {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "github_username", nullable = false)
    private String githubUsername;

    @Column(name = "github_access_token", nullable = false, length = 512)
    private String githubAccessToken;
}
