package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.WorkspaceSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceSnapshotRepository extends JpaRepository<WorkspaceSnapshot, String> {
    List<WorkspaceSnapshot> findByWorkspaceIdOrderByCreatedAtDesc(String workspaceId);
}
