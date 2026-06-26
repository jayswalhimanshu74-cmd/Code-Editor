package com.exaple.codeEditer.Code.Editor.service;

import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class PathSecurityService {

    public boolean isPathSafe(String baseDir, String relativePath) {
        if (relativePath == null) return false;
        if (relativePath.contains("..") || relativePath.contains("\\..") || relativePath.contains("../")) {
            return false;
        }
        try {
            Path base = Paths.get(baseDir).toAbsolutePath().normalize();
            Path resolved = base.resolve(relativePath).toAbsolutePath().normalize();
            return resolved.startsWith(base);
        } catch (Exception e) {
            return false;
        }
    }

    public void validatePath(String baseDir, String relativePath) {
        if (!isPathSafe(baseDir, relativePath)) {
            throw new SecurityException("Directory traversal or workspace escape attempt detected: " + relativePath);
        }
    }

    public boolean isNameSafe(String name) {
        if (name == null || name.isEmpty()) return false;
        // Names must not contain directory separators or traversal sequences
        return !name.contains("/") && !name.contains("\\") && !name.contains("..");
    }
}
