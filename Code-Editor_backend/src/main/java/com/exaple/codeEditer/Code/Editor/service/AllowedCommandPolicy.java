package com.exaple.codeEditer.Code.Editor.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
public class AllowedCommandPolicy {

    private static final Set<String> BLOCKED_COMMANDS = new HashSet<>(Arrays.asList(
            "reboot", "shutdown", "init", "poweroff", "halt", 
            "chroot", "dd", "mkfs", "fdisk", "mount", "umount",
            "iptables", "ufw", "sysctl", "modprobe", "insmod", "rmmod"
    ));

    public boolean isCommandAllowed(String baseCommand) {
        if (baseCommand == null || baseCommand.isBlank()) {
            return false;
        }
        
        String cleanCmd = baseCommand.trim().toLowerCase().split("\\s+")[0];
        
        // Block dangerous system-altering binaries
        return !BLOCKED_COMMANDS.contains(cleanCmd);
    }
}
