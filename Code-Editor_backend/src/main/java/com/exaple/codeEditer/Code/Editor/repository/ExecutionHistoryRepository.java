package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.ExecutionHistory;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExecutionHistoryRepository extends JpaRepository<ExecutionHistory, UUID> {
    List<ExecutionHistory> findByRoomOrderByExecutedAtDesc(Room room);
    List<ExecutionHistory> findTop10ByRoomOrderByExecutedAtDesc(Room room);
}