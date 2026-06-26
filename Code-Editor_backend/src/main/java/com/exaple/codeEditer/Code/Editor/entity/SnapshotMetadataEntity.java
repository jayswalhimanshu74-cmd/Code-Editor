package com.exaple.codeEditer.Code.Editor.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "snapshot_metadata")
@Data
public class SnapshotMetadataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "snapshot_id", nullable = false, unique = true)
    private String snapshotId;

    @Column(name = "git_commit_hash")
    private String gitCommitHash;

    @Column(name = "active_ports_json", length = 1000)
    private String activePortsJson;

    @Column(name = "runtimes_json", length = 1000)
    private String runtimesJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
