package com.exaple.codeEditer.Code.Editor.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class RuntimeImage {

    @Id
    private String id;

    private String name;

    private String imageTag;

    private String language;

    private String description;

    private boolean isDefault;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
    }
}
