package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.dto.log.FileEditLogDTO;
import com.exaple.codeEditer.Code.Editor.entity.*;
import com.exaple.codeEditer.Code.Editor.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileEditLogService {

    private final FileEditLogRepository logRepository;
    private final FileRepository fileRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    // Debounce: don't spam DB with every keystroke.
    // Only write an EDIT log if 5s have passed since last log for that file+user.
    private final ConcurrentHashMap<String, Long> lastEditLogTime = new ConcurrentHashMap<>();

    // ── Called from WebSocket handler (EDIT) ──────────────────────────────────
    @Transactional
    public void logEdit(UUID fileId, UUID roomId, String userEmail,
            String fileName, String contentSnapshot) {

        String debounceKey = fileId + "::" + userEmail;
        long now = System.currentTimeMillis();
        Long last = lastEditLogTime.get(debounceKey);

        // Skip if last log was less than 5 seconds ago
        if (last != null && (now - last) < 5_000)
            return;
        lastEditLogTime.put(debounceKey, now);

        try {
            Room room = roomRepository.findById(roomId).orElse(null);
            User user = userRepository.findByEmail(userEmail).orElse(null);
            File file = fileRepository.findById(fileId).orElse(null);

            if (room == null || user == null)
                return;

            FileEditLog editLog = FileEditLog.builder()
                    .room(room)
                    .file(file)
                    .user(user)
                    .fileName(fileName != null ? fileName : "unknown")
                    .actionType("EDIT")
                    .contentSnapshot(contentSnapshot)
                    .build();

            logRepository.save(editLog);
            log.debug("Edit log saved — user: {}, file: {}", userEmail, fileName);

        } catch (Exception e) {
            log.warn("Failed to save edit log: {}", e.getMessage());
        }
    }

    // ── Called from FileService (CREATE / DELETE / RENAME) ────────────────────
    @Transactional
    public void logAction(UUID fileId, UUID roomId, String userEmail,
            String fileName, String actionType) {
        try {
            Room room = roomRepository.findById(roomId).orElse(null);
            User user = userRepository.findByEmail(userEmail).orElse(null);
            File file = fileId != null ? fileRepository.findById(fileId).orElse(null) : null;

            if (room == null || user == null)
                return;

            FileEditLog entry = FileEditLog.builder()
                    .room(room)
                    .file(file)
                    .user(user)
                    .fileName(fileName)
                    .actionType(actionType)
                    .contentSnapshot(null) // no snapshot for meta actions
                    .build();

            logRepository.save(entry);
            log.info("{} log — user: {}, file: {}, room: {}",
                    actionType, userEmail, fileName, roomId);

        } catch (Exception e) {
            log.warn("Failed to save {} log: {}", actionType, e.getMessage());
        }
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<FileEditLogDTO> getRoomLogs(UUID roomId, int page, int size) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return logRepository.findByRoomOrderByChangedAtDesc(room, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<FileEditLogDTO> getFileLogs(UUID fileId, int page, int size) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return logRepository.findByFileOrderByChangedAtDesc(file, pageable)
                .map(this::toDTO);
    }

    public Page<FileEditLogDTO> getUserLogs(UUID roomId, String email, int page, int size) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return logRepository.findByRoomAndUserEmailOrderByChangedAtDesc(room, email, pageable)
                .map(this::toDTO);
    }

    private FileEditLogDTO toDTO(FileEditLog log) {
        return FileEditLogDTO.builder()
                .id(log.getId())
                .actionType(log.getActionType())
                .fileName(log.getFileName())
                .fileId(log.getFile() != null ? log.getFile().getId() : null)
                .username(log.getUser().getUsername())
                .userEmail(log.getUser().getEmail())
                .contentSnapshot(log.getContentSnapshot())
                .changedAt(log.getChangedAt())
                .build();
    }
}