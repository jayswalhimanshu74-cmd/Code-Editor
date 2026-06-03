package com.exaple.codeEditer.Code.Editor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "file_edit_logs", indexes = {
    @Index(name = "idx_log_file", columnList = "file_id"),
    @Index(name = "idx_log_room", columnList = "room_id"),
    @Index(name = "idx_log_changed_at", columnList = "changed_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FileEditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")           // nullable — file may be deleted
    private File file;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;                 // snapshot of name at log time

    @Column(name = "action_type", nullable = false, length = 20)
    private String actionType;               // EDIT | CREATE | DELETE | RENAME

    @Column(name = "content_snapshot", columnDefinition = "TEXT")
    private String contentSnapshot;          // only set for EDIT actions

    @CreationTimestamp
    @Column(name = "changed_at", updatable = false)
    private LocalDateTime changedAt;
}