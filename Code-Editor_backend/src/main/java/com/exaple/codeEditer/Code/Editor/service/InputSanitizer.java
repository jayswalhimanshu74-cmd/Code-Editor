package com.exaple.codeEditer.Code.Editor.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
@Slf4j
public class InputSanitizer {

    private static final Pattern PATH_TRAVERSAL_PATTERN = Pattern.compile("(\\.\\./|\\.\\.\\\\)");

    public String sanitizeCommand(String command) {
        if (command == null) return "";
        // Clean null characters or control characters
        return command.replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]", "");
    }

    public String sanitizePath(String path) {
        if (path == null) return "";
        // Block path traversal tricks
        String cleaned = PATH_TRAVERSAL_PATTERN.matcher(path).replaceAll("");
        // Remove trailing or leading directory indicators to stay within limits
        return cleaned.trim();
    }
}
