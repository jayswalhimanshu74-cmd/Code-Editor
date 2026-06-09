package com.exaple.codeEditer.Code.Editor.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "yjs_documents", uniqueConstraints = @UniqueConstraint(columnNames = { "room_id", "file_id" }))
public class YjsDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "room_id", nullable = false)
    private String roomId;

    // fileId can be null — means it's the "main" editor buffer for the room
    @Column(name = "file_id")
    private String fileId;

    // Yjs binary state vector — stored as raw bytes
    @Column(name = "state", columnDefinition = "bytea")
    private byte[] state;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    public void touch() {
        this.updatedAt = Instant.now();
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    // public String getId() { return id; }

    // public String getRoomId() { return roomId; }
    // public void setRoomId(String roomId) { this.roomId = roomId; }

    // public String getFileId() { return fileId; }
    // public void setFileId(String fileId) { this.fileId = fileId; }

    // public byte[] getState() { return state; }
    // public void setState(byte[] state) { this.state = state; }

    // public Instant getUpdatedAt() { return updatedAt; }
    // public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}