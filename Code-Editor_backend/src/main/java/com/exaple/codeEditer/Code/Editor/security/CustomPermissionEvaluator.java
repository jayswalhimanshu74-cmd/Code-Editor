package com.exaple.codeEditer.Code.Editor.security;

import com.exaple.codeEditer.Code.Editor.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Component
@RequiredArgsConstructor
public class CustomPermissionEvaluator implements PermissionEvaluator {

    private final AuthorizationService authorizationService;

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null || targetDomainObject == null || !(permission instanceof String)) {
            return false;
        }
        String workspaceId = targetDomainObject.toString();
        String userEmail = authentication.getName();
        return authorizationService.hasPermission(userEmail, workspaceId, (String) permission);
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        if (authentication == null || targetId == null || !(permission instanceof String)) {
            return false;
        }
        String workspaceId = targetId.toString();
        String userEmail = authentication.getName();
        return authorizationService.hasPermission(userEmail, workspaceId, (String) permission);
    }
}
