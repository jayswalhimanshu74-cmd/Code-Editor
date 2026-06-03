package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.FileEditLog;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.entity.File;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FileEditLogRepository extends JpaRepository<FileEditLog, UUID> {

    // All logs for a room (for the room-level log view)
    Page<FileEditLog> findByRoomOrderByChangedAtDesc(Room room, Pageable pageable);

    // Logs for a specific file
    Page<FileEditLog> findByFileOrderByChangedAtDesc(File file, Pageable pageable);

    // Logs by a specific user in a room
    Page<FileEditLog> findByRoomAndUserEmailOrderByChangedAtDesc(
        Room room, String email, Pageable pageable);
}