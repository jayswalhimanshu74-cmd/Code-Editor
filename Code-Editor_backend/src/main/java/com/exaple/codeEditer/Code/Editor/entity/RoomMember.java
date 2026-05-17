package com.exaple.codeEditer.Code.Editor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "room_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "user_id"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String role = "editor"; // owner | editor | viewer

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;
}