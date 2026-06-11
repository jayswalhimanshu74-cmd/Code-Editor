package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.WorkspaceEntity;
import com.exaple.codeEditer.Code.Editor.entity.WorkspaceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkspaceRepository extends JpaRepository<WorkspaceEntity, String> {
    List<WorkspaceEntity> findByStatus(WorkspaceStatus status);
    long countByStatus(WorkspaceStatus status);
}
