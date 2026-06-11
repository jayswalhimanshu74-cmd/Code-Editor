package com.exaple.codeEditer.Code.Editor.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class WorkspaceEntity {

    @Id
    private String id; // Will map directly to roomId for 1:1 relationship

    private String ownerId;

    private String containerId;

    @Enumerated(EnumType.STRING)
    private WorkspaceStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime lastSeen;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastSeen = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastSeen = LocalDateTime.now();
    }
}
