package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.WorkspaceSnapshot;
import com.exaple.codeEditer.Code.Editor.entity.SnapshotMetadataEntity;
import com.exaple.codeEditer.Code.Editor.entity.WorkspacePort;
import com.exaple.codeEditer.Code.Editor.repository.WorkspaceSnapshotRepository;
import com.exaple.codeEditer.Code.Editor.repository.SnapshotMetadataRepository;
import com.exaple.codeEditer.Code.Editor.repository.WorkspacePortRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.lib.Constants;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceSnapshotService {

    private final WorkspaceSnapshotRepository snapshotRepository;
    private final SnapshotMetadataRepository metadataRepository;
    private final WorkspacePortRepository workspacePortRepository;
    private final SnapshotStorageService storageService;
    private final SnapshotRestoreService restoreService;
    private final DockerWorkspaceService dockerWorkspaceService;
    private final ObjectMapper objectMapper;

    private static final String HOST_WORKSPACES_DIR = System.getProperty("user.dir") + "/cloud-workspaces";
    private static final String HOST_SNAPSHOTS_DIR = System.getProperty("user.dir") + "/cloud-snapshots";

    public WorkspaceSnapshot createSnapshot(String workspaceId, String name, String description) {
        File snapshotsDir = new File(HOST_SNAPSHOTS_DIR);
        if (!snapshotsDir.exists()) {
            snapshotsDir.mkdirs();
        }

        String snapshotId = UUID.randomUUID().toString();
        String archiveName = snapshotId + ".zip";

        // Ensure host files match DB
        dockerWorkspaceService.syncWorkspaceToHost(workspaceId);

        Path archivePath = Paths.get(HOST_SNAPSHOTS_DIR, archiveName);
        Path sourcePath = Paths.get(HOST_WORKSPACES_DIR, workspaceId);

        try {
            // Zip files
            storageService.zipDirectory(sourcePath, archivePath);

            // Save Snapshot Entity
            WorkspaceSnapshot snapshot = new WorkspaceSnapshot();
            snapshot.setId(snapshotId);
            snapshot.setWorkspaceId(workspaceId);
            snapshot.setName(name);
            snapshot.setDescription(description);
            snapshot.setArchivePath(archiveName);
            WorkspaceSnapshot savedSnapshot = snapshotRepository.save(snapshot);

            // Fetch Git commit hash
            String gitCommitHash = null;
            File gitDir = new File(sourcePath.toFile(), ".git");
            if (gitDir.exists()) {
                try (Git git = Git.open(sourcePath.toFile()); Repository repository = git.getRepository()) {
                    ObjectId head = repository.resolve(Constants.HEAD);
                    if (head != null) {
                        gitCommitHash = head.getName();
                    }
                } catch (Exception e) {
                    log.warn("Failed to retrieve git commit hash for snapshot {}: {}", snapshotId, e.getMessage());
                }
            }

            // Fetch exposed ports
            List<Integer> activePorts = workspacePortRepository.findByWorkspaceId(workspaceId).stream()
                    .map(WorkspacePort::getPort)
                    .collect(Collectors.toList());
            String activePortsJson = objectMapper.writeValueAsString(activePorts);

            // Save Snapshot Metadata
            SnapshotMetadataEntity metadata = new SnapshotMetadataEntity();
            metadata.setSnapshotId(snapshotId);
            metadata.setGitCommitHash(gitCommitHash);
            metadata.setActivePortsJson(activePortsJson);
            metadata.setRuntimesJson("[]"); // Default empty list placeholder
            metadataRepository.save(metadata);

            log.info("Created snapshot {} with metadata successfully", snapshotId);
            return savedSnapshot;
        } catch (IOException e) {
            log.error("Failed to create snapshot archive", e);
            throw new RuntimeException("Failed to compress workspace", e);
        }
    }

    public WorkspaceSnapshot restoreSnapshot(String workspaceId, String snapshotId) {
        return restoreService.restore(workspaceId, snapshotId);
    }

    public List<WorkspaceSnapshot> listSnapshots(String workspaceId) {
        return snapshotRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
    }

    @Transactional
    public void deleteSnapshot(String snapshotId) {
        snapshotRepository.findById(snapshotId).ifPresent(snapshot -> {
            try {
                Files.deleteIfExists(Paths.get(HOST_SNAPSHOTS_DIR, snapshot.getArchivePath()));
            } catch (IOException e) {
                log.warn("Failed to delete archive file for snapshot {}", snapshotId, e);
            }
            metadataRepository.deleteBySnapshotId(snapshotId);
            snapshotRepository.delete(snapshot);
        });
    }
}
