package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.*;
import com.exaple.codeEditer.Code.Editor.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SnapshotRestoreService {

    private final WorkspaceSnapshotRepository snapshotRepository;
    private final SnapshotMetadataRepository metadataRepository;
    private final WorkspaceLifecycleService workspaceLifecycleService;
    private final RoomRepository roomRepository;
    private final FileRepository fileRepository;
    private final FileEditLogRepository fileEditLogRepository;
    private final SnapshotStorageService storageService;
    private final PreviewService previewService;
    private final WorkspacePortRepository workspacePortRepository;
    private final ObjectMapper objectMapper;

    private static final String HOST_WORKSPACES_DIR = System.getProperty("user.dir") + "/cloud-workspaces";
    private static final String HOST_SNAPSHOTS_DIR = System.getProperty("user.dir") + "/cloud-snapshots";

    @Transactional
    public WorkspaceSnapshot restore(String workspaceId, String snapshotId) {
        WorkspaceSnapshot snapshot = snapshotRepository.findById(snapshotId)
                .orElseThrow(() -> new RuntimeException("Snapshot not found"));

        Room room = roomRepository.findById(UUID.fromString(workspaceId))
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Path archivePath = Paths.get(HOST_SNAPSHOTS_DIR, snapshot.getArchivePath());
        if (!Files.exists(archivePath)) {
            throw new RuntimeException("Snapshot archive file missing.");
        }

        Path targetPath = Paths.get(HOST_WORKSPACES_DIR, workspaceId);

        try {
            // 1. Stop active workspace container
            workspaceLifecycleService.stopWorkspace(workspaceId);

            // 2. Wipe workspace folder
            if (Files.exists(targetPath)) {
                storageService.deleteDirectory(targetPath);
            }
            Files.createDirectories(targetPath);

            // 3. Extract ZIP
            storageService.unzipArchive(archivePath, targetPath);

            // 4. Clean out DB workspace file definitions
            List<File> existingFiles = fileRepository.findByRoom(room);
            for (File f : existingFiles) {
                fileEditLogRepository.setFileToNullByFileId(f.getId());
            }
            fileRepository.deleteAll(existingFiles);

            // 5. Restore files from disk back into database
            syncDiskToDatabase(targetPath.toFile(), room, null);

            // 6. Restore Preview / Port configurations from metadata if present
            Optional<SnapshotMetadataEntity> metadataOpt = metadataRepository.findBySnapshotId(snapshotId);
            if (metadataOpt.isPresent()) {
                SnapshotMetadataEntity meta = metadataOpt.get();
                if (meta.getActivePortsJson() != null && !meta.getActivePortsJson().isBlank()) {
                    try {
                        List<Integer> ports = objectMapper.readValue(meta.getActivePortsJson(), new TypeReference<List<Integer>>() {});
                        // Clean existing ports first
                        workspacePortRepository.deleteByWorkspaceId(workspaceId);
                        for (Integer port : ports) {
                            previewService.registerPort(workspaceId, port);
                        }
                    } catch (Exception e) {
                        log.warn("Failed to restore preview metadata from snapshot: {}", e.getMessage());
                    }
                }
            }

            // 7. Restart the Workspace
            workspaceLifecycleService.startWorkspace(workspaceId, room.getOwner().getId().toString());

            log.info("Successfully completed restore of workspace {} from snapshot {}", workspaceId, snapshotId);
            return snapshot;
        } catch (Exception e) {
            log.error("Failed to restore workspace snapshot", e);
            throw new RuntimeException("Failed to restore snapshot", e);
        }
    }

    private void syncDiskToDatabase(java.io.File currentDiskDir, Room room, File parentDbFile) {
        java.io.File[] files = currentDiskDir.listFiles();
        if (files == null) return;

        for (java.io.File file : files) {
            File dbFile = new File();
            dbFile.setRoom(room);
            dbFile.setName(file.getName());
            dbFile.setParent(parentDbFile);
            dbFile.setIsFolder(file.isDirectory());

            if (file.isDirectory()) {
                dbFile.setLanguage("folder");
                dbFile = fileRepository.save(dbFile);
                syncDiskToDatabase(file, room, dbFile);
            } else {
                try {
                    dbFile.setContent(Files.readString(file.toPath()));
                } catch (IOException e) {
                    dbFile.setContent("");
                }

                String lang = "plaintext";
                if (file.getName().endsWith(".js")) lang = "javascript";
                else if (file.getName().endsWith(".ts")) lang = "typescript";
                else if (file.getName().endsWith(".py")) lang = "python";
                else if (file.getName().endsWith(".java")) lang = "java";

                dbFile.setLanguage(lang);
                fileRepository.save(dbFile);
            }
        }
    }
}
