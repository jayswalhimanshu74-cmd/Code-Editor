package com.exaple.codeEditer.Code.Editor.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
public class AllowedCommandPolicy {

    private static final Set<String> ALLOWED_COMMANDS = new HashSet<>(Arrays.asList(
            "ls", "cd", "cat", "echo", "pwd", "mkdir", "rm", "cp", "mv", "touch", "grep", "find", "git",
            "node", "npm", "python", "python3", "pip", "java", "javac", "mvn"
    ));

    public boolean isCommandAllowed(String baseCommand) {
        if (baseCommand == null || baseCommand.isBlank()) {
            return false;
        }

        // Block command injection via backticks or command substitution
        if (baseCommand.contains("`") || baseCommand.contains("$(")) {
            return false;
        }

        // Split by shell command chain operators: ;, &&, ||, |, &, newline, carriage return
        String[] subCommands = baseCommand.split(";|&&|\\|\\||\\||&|\\n|\\r");
        for (String subCmd : subCommands) {
            String trimmedSub = subCmd.trim();
            if (trimmedSub.isEmpty()) {
                continue;
            }

            // Extract the first word (binary name)
            String cleanCmd = trimmedSub.split("\\s+")[0].toLowerCase();

            // Strip path prefixes (e.g., ./reboot or /sbin/reboot)
            if (cleanCmd.startsWith("./")) {
                cleanCmd = cleanCmd.substring(2);
            }
            int lastSlash = cleanCmd.lastIndexOf('/');
            if (lastSlash != -1) {
                cleanCmd = cleanCmd.substring(lastSlash + 1);
            }

            if (!ALLOWED_COMMANDS.contains(cleanCmd)) {
                return false;
            }
        }

        return true;
    }
}
