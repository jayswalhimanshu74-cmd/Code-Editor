package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FilesystemCleanupService {

    private final RoomRepository roomRepository;
    private final SnapshotStorageService storageService;
    private static final String HOST_WORKSPACES_DIR = System.getProperty("user.dir") + "/cloud-workspaces";

    public void cleanupOrphanedDirectories() {
        log.info("Running filesystem directory cleanup sweep...");
        File baseDir = new File(HOST_WORKSPACES_DIR);
        if (!baseDir.exists() || !baseDir.isDirectory()) {
            return;
        }

        File[] dirs = baseDir.listFiles(File::isDirectory);
        if (dirs == null) return;

        for (File dir : dirs) {
            String dirName = dir.getName();
            try {
                UUID roomId = UUID.fromString(dirName);
                if (!roomRepository.existsById(roomId)) {
                    log.info("Found orphaned directory: {}. Cleaning up files...", dirName);
                    storageService.deleteDirectory(dir.toPath());
                }
            } catch (IllegalArgumentException e) {
                // Not a UUID directory, skip or log
                log.debug("Skipping non-UUID workspace directory: {}", dirName);
            } catch (IOException e) {
                log.error("Failed to delete orphaned directory: {}", dir.getAbsolutePath(), e);
            }
        }
    }
}
