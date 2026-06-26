package com.exaple.codeEditer.Code.Editor.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "workspace_roles", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"workspace_id", "user_email"})
})
@Data
public class WorkspaceRoleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workspace_id", nullable = false)
    private String workspaceId;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String role; // OWNER, ADMIN, EDITOR, VIEWER
}
