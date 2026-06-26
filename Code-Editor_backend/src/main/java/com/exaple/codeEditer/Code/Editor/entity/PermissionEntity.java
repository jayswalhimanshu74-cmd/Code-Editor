package com.exaple.codeEditer.Code.Editor.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "permissions")
@Data
public class PermissionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // WORKSPACE_MANAGE, FILE_EDIT, GIT_OP, TERMINAL_ACCESS, PREVIEW_ACCESS, USER_MANAGE
}
