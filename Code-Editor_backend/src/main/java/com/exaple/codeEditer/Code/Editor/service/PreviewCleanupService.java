package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreviewCleanupService {

    private final RoomRepository roomRepository;

    public void cleanupStalePreviews() {
        log.info("Running Traefik preview routing cleanup sweep...");
        File configDir = new File(TraefikManagerService.TRAEFIK_CONFIG_DIR);
        if (!configDir.exists() || !configDir.isDirectory()) {
            return;
        }

        File[] files = configDir.listFiles((dir, name) -> name.startsWith("ws-") && name.endsWith(".yml"));
        if (files == null) return;

        for (File file : files) {
            String name = file.getName();
            // Expected format: ws-{roomId}-{port}.yml
            try {
                String[] parts = name.split("-");
                if (parts.length >= 3) {
                    String roomIdStr = parts[1];
                    UUID roomId = UUID.fromString(roomIdStr);
                    if (!roomRepository.existsById(roomId)) {
                        log.info("Found stale preview configuration: {}. Deleting...", name);
                        Files.deleteIfExists(file.toPath());
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse or clean up routing file: {}", name, e);
            }
        }
    }
}
