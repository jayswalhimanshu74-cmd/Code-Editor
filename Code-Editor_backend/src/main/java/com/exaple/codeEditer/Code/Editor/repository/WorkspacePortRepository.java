package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.WorkspacePort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspacePortRepository extends JpaRepository<WorkspacePort, Long> {
    List<WorkspacePort> findByWorkspaceId(String workspaceId);
    Optional<WorkspacePort> findByWorkspaceIdAndPort(String workspaceId, int port);
    void deleteByWorkspaceId(String workspaceId);
}
