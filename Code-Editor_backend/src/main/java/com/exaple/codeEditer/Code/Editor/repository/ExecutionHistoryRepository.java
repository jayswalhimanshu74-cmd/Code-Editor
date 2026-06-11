package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@Repository
public interface ExecutionHistoryRepository extends JpaRepository<ExecutionHistory, UUID> {
    List<ExecutionHistory> findByRoomOrderByExecutedAtDesc(Room room);

    List<ExecutionHistory> findTop10ByRoomOrderByExecutedAtDesc(Room room);

    Page<ExecutionHistory> findByRoomOrderByExecutedAtDesc(Room room, Pageable pageable);

    List<ExecutionHistory> findByStatusAndExecutedAtBefore(ExecutionHistory.ExecutionStatus status,
            LocalDateTime threshold);
}