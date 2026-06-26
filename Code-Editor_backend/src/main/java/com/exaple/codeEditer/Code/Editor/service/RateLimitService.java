package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final RedisRateLimitStore rateLimitStore;

    public boolean allowLogin(String ip) {
        return rateLimitStore.isAllowed("login:" + ip, 5, 60);
    }

    public boolean allowRegister(String ip) {
        return rateLimitStore.isAllowed("register:" + ip, 3, 60);
    }

    public boolean allowExecution(String userEmail) {
        return rateLimitStore.isAllowed("execution:" + userEmail, 10, 60);
    }

    public boolean allowPasswordReset(String ip) {
        return rateLimitStore.isAllowed("passwordreset:" + ip, 3, 900); // 15 mins = 900 seconds
    }

    public boolean allowAiChat(String userEmail) {
        return rateLimitStore.isAllowed("aichat:" + userEmail, 20, 60); // 20 messages/min
    }

    public boolean allowWebSocket(String userEmail) {
        return rateLimitStore.isAllowed("websocket:" + userEmail, 60, 60);
    }

    public boolean allowTerminal(String userEmail) {
        return rateLimitStore.isAllowed("terminal:" + userEmail, 30, 60);
    }

    public boolean allowPreview(String userEmail) {
        return rateLimitStore.isAllowed("preview:" + userEmail, 10, 60);
    }

    public boolean allowGit(String userEmail) {
        return rateLimitStore.isAllowed("git:" + userEmail, 15, 60);
    }

    public boolean allowWorkspaceCreation(String userEmail) {
        return rateLimitStore.isAllowed("workspace:create:" + userEmail, 5, 60);
    }
}