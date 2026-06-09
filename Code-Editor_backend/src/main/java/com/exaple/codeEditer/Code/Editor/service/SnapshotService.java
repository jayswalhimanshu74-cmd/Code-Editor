package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.CodeSnapshot;
import com.exaple.codeEditer.Code.Editor.entity.File;
import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.CodeSnapshotRepository;
import com.exaple.codeEditer.Code.Editor.repository.FileRepository;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomMemberRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SnapshotService {

    private final CodeSnapshotRepository snapshotRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;

    // ── Save a snapshot ───────────────────────────────────────────────────────
    @Transactional
    public CodeSnapshot saveSnapshot(UUID roomId, UUID fileId, String email, String label) {
        checkMembership(roomId, email);

        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        CodeSnapshot snapshot = CodeSnapshot.builder()
                .file(file)
                .savedBy(user)
                .content(file.getContent())
                .label(label != null && !label.isBlank() ? label : "snapshot")
                .build();

        CodeSnapshot saved = snapshotRepository.save(snapshot);
        log.info("[Snapshot] Saved snapshot '{}' for file {} by {}", label, fileId, email);
        return saved;
    }

    // ── Get all snapshots for a file ──────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<CodeSnapshot> getSnapshots(UUID roomId, UUID fileId, String email) {
        checkMembership(roomId, email);

        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        return snapshotRepository.findByFileOrderByCreatedAtDesc(file);
    }

    // ── Restore a snapshot ────────────────────────────────────────────────────
    @Transactional
    public File restoreSnapshot(UUID roomId, UUID snapshotId, String email) {
        checkMembership(roomId, email);

        CodeSnapshot snapshot = snapshotRepository.findById(snapshotId)
                .orElseThrow(() -> new RuntimeException("Snapshot not found"));

        File file = snapshot.getFile();
        file.setContent(snapshot.getContent());
        File saved = fileRepository.save(file);

        log.info("[Snapshot] Restored snapshot {} to file {} by {}", snapshotId, file.getId(), email);
        return saved;
    }

    // ── Delete a snapshot ─────────────────────────────────────────────────────
    @Transactional
    public void deleteSnapshot(UUID roomId, UUID snapshotId, String email) {
        checkMembership(roomId, email);
        CodeSnapshot snapshot = snapshotRepository.findById(snapshotId)
                .orElseThrow(() -> new RuntimeException("Snapshot not found"));
        snapshotRepository.delete(snapshot);
        log.info("[Snapshot] Deleted snapshot {} by {}", snapshotId, email);
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private void checkMembership(UUID roomId, String email) {
        var room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (!roomMemberRepository.existsByRoomAndUser(room, user)) {
            throw new RuntimeException("Access denied — not a member");
        }
    }
}