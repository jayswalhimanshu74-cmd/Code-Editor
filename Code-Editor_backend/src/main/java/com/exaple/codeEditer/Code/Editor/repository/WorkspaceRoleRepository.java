package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.WorkspaceRoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRoleRepository extends JpaRepository<WorkspaceRoleEntity, Long> {
    Optional<WorkspaceRoleEntity> findByWorkspaceIdAndUserEmail(String workspaceId, String userEmail);
    List<WorkspaceRoleEntity> findByWorkspaceId(String workspaceId);
    void deleteByWorkspaceIdAndUserEmail(String workspaceId, String userEmail);
}
