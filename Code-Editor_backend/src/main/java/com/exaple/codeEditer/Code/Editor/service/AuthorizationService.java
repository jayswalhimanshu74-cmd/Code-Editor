package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.RoomMember;
import com.exaple.codeEditer.Code.Editor.repository.RoomMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorizationService {

    private final RoomMemberRepository roomMemberRepository;

    public boolean hasPermission(String userEmail, String workspaceId, String requiredPermission) {
        log.debug("hasPermission - userEmail: {}, workspaceId: {}, requiredPermission: {}", userEmail, workspaceId, requiredPermission);
        UUID roomUUID;
        try {
            roomUUID = UUID.fromString(workspaceId);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid workspaceId UUID format: {}", workspaceId);
            return false;
        }

        Optional<RoomMember> memberOpt = roomMemberRepository.findByRoomIdAndUserEmail(roomUUID, userEmail);
        if (memberOpt.isEmpty()) {
            log.debug("No room member found for room {} and user {}", roomUUID, userEmail);
            return false;
        }

        String role = memberOpt.get().getRole().toUpperCase();
        log.debug("Member found. Role: {}", role);

        switch (requiredPermission.toUpperCase()) {
            case "USER_MANAGEMENT":
            case "WORKSPACE_DELETE":
                return "OWNER".equals(role);

            case "WORKSPACE_MANAGE":
            case "WORKSPACE_EDIT":
                return "OWNER".equals(role) || "ADMIN".equals(role);

            case "TERMINAL_ACCESS":
            case "GIT_OPERATIONS":
            case "FILE_MANAGEMENT":
                return "OWNER".equals(role) || "ADMIN".equals(role) || "EDITOR".equals(role);

            case "PREVIEW_ACCESS":
            case "READ_ONLY":
                return "OWNER".equals(role) || "ADMIN".equals(role) || "EDITOR".equals(role) || "VIEWER".equals(role);

            default:
                log.warn("Unknown permission requested: {}", requiredPermission);
                return false;
        }
    }
}
