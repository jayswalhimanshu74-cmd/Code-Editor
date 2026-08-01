package com.exaple.codeEditer.Code.Editor.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(
    name = "workspace_port",
    indexes = {
        @Index(name = "idx_workspace_port_workspace_id", columnList = "workspaceId")
    }
)
@Data
public class WorkspacePort {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // We store the roomId (UUID as string) to tie it to the workspace container
    private String workspaceId;

    private int port;
    private String status;

}
