package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.WorkspaceEntity;
import com.exaple.codeEditer.Code.Editor.entity.WorkspaceSnapshot;
import com.exaple.codeEditer.Code.Editor.repository.WorkspaceRepository;
import com.exaple.codeEditer.Code.Editor.repository.WorkspaceSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
    
import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceSnapshotService {

    private final WorkspaceSnapshotRepository snapshotRepository;
    private final WorkspaceLifecycleService workspaceLifecycleService;
    private final WorkspaceRepository workspaceRepository;
    private final com.exaple.codeEditer.Code.Editor.repository.RoomRepository roomRepository;
    private final com.exaple.codeEditer.Code.Editor.repository.FileRepository fileRepository;
    private final com.exaple.codeEditer.Code.Editor.repository.FileEditLogRepository fileEditLogRepository;
    private final DockerWorkspaceService dockerWorkspaceService;

    private static final String HOST_WORKSPACES_DIR = System.getProperty("user.dir") + "/cloud-workspaces";
    private static final String HOST_SNAPSHOTS_DIR = System.getProperty("user.dir") + "/cloud-snapshots";

    /**
     * Note: Migration required for existing snapshots.
     * Existing rows with absolute paths will need a one-time UPDATE to strip the directory prefix.
     */
    public WorkspaceSnapshot createSnapshot(String workspaceId, String name, String description) {
        com.exaple.codeEditer.Code.Editor.entity.Room room = roomRepository.findById(UUID.fromString(workspaceId))
                .orElseThrow(() -> new RuntimeException("Room not found"));

        File snapshotsDir = new File(HOST_SNAPSHOTS_DIR);
        if (!snapshotsDir.exists()) {
            snapshotsDir.mkdirs();
        }

        String snapshotId = UUID.randomUUID().toString();
        String archiveName = snapshotId + ".zip";
        // Ensure the host files match the database BEFORE zipping!
        dockerWorkspaceService.syncWorkspaceToHost(workspaceId);

        Path archivePath = Paths.get(HOST_SNAPSHOTS_DIR, archiveName);
        Path sourcePath = Paths.get(HOST_WORKSPACES_DIR, workspaceId);

        try {
            zipDirectory(sourcePath, archivePath);
            
            WorkspaceSnapshot snapshot = new WorkspaceSnapshot();
            snapshot.setId(snapshotId);
            snapshot.setWorkspaceId(workspaceId);
            snapshot.setName(name);
            snapshot.setDescription(description);
            snapshot.setArchivePath(archiveName);
            
            return snapshotRepository.save(snapshot);
        } catch (IOException e) {
            log.error("Failed to create snapshot archive", e);
            throw new RuntimeException("Failed to compress workspace", e);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public WorkspaceSnapshot restoreSnapshot(String workspaceId, String snapshotId) {
        WorkspaceSnapshot snapshot = snapshotRepository.findById(snapshotId)
                .orElseThrow(() -> new RuntimeException("Snapshot not found"));
        
        com.exaple.codeEditer.Code.Editor.entity.Room room = roomRepository.findById(UUID.fromString(workspaceId))
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Path archivePath = Paths.get(HOST_SNAPSHOTS_DIR, snapshot.getArchivePath());
        if (!Files.exists(archivePath)) {
            throw new RuntimeException("Snapshot archive file missing.");
        }

        Path targetPath = Paths.get(HOST_WORKSPACES_DIR, workspaceId);

        try {
            // 1. Stop container cleanly
            workspaceLifecycleService.stopWorkspace(workspaceId);

            // 2. Wipe current workspace directory
            if (Files.exists(targetPath)) {
                deleteDirectory(targetPath);
            }
            Files.createDirectories(targetPath);

            // 3. Extract snapshot
            unzipArchive(archivePath, targetPath);

            // 4. Sync extracted files BACK to database!
            // First, delete all existing files for this room from DB
            List<com.exaple.codeEditer.Code.Editor.entity.File> existingFiles = fileRepository.findByRoom(room);
            for (com.exaple.codeEditer.Code.Editor.entity.File f : existingFiles) {
                fileEditLogRepository.setFileToNullByFileId(f.getId());
            }
            fileRepository.deleteAll(existingFiles);

            // Then recursively read from disk and save to DB
            syncDiskToDatabase(targetPath.toFile(), room, null);

            // 5. Restart container
            workspaceLifecycleService.startWorkspace(workspaceId, room.getOwner().getId().toString());

            log.info("Successfully restored workspace {} from snapshot {}", workspaceId, snapshotId);
            return snapshot;
        } catch (Exception e) {
            log.error("Failed to restore snapshot", e);
            throw new RuntimeException("Failed to restore snapshot", e);
        }
    }

    private void syncDiskToDatabase(File currentDiskDir, com.exaple.codeEditer.Code.Editor.entity.Room room, com.exaple.codeEditer.Code.Editor.entity.File parentDbFile) {
        File[] files = currentDiskDir.listFiles();
        if (files == null) return;

        for (File file : files) {
            com.exaple.codeEditer.Code.Editor.entity.File dbFile = new com.exaple.codeEditer.Code.Editor.entity.File();
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

    public List<WorkspaceSnapshot> listSnapshots(String workspaceId) {
        return snapshotRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
    }

    public void deleteSnapshot(String snapshotId) {
        snapshotRepository.findById(snapshotId).ifPresent(snapshot -> {
            try {
                Files.deleteIfExists(Paths.get(HOST_SNAPSHOTS_DIR, snapshot.getArchivePath()));
            } catch (IOException e) {
                log.warn("Failed to delete archive file for snapshot {}", snapshotId, e);
            }
            snapshotRepository.delete(snapshot);
        });
    }

    private void zipDirectory(Path sourceDir, Path zipFile) throws IOException {
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(zipFile.toFile()))) {
            Files.walkFileTree(sourceDir, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    if (!attrs.isRegularFile()) return FileVisitResult.CONTINUE;
                    
                    Path targetFile = sourceDir.relativize(file);
                    zos.putNextEntry(new ZipEntry(targetFile.toString().replace("\\", "/")));
                    Files.copy(file, zos);
                    zos.closeEntry();
                    return FileVisitResult.CONTINUE;
                }
            });
        }
    }

    private void unzipArchive(Path zipFile, Path targetDir) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile.toFile()))) {
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                File newFile = newFile(targetDir.toFile(), zipEntry);
                if (zipEntry.isDirectory()) {
                    if (!newFile.isDirectory() && !newFile.mkdirs()) {
                        throw new IOException("Failed to create directory " + newFile);
                    }
                } else {
                    File parent = newFile.getParentFile();
                    if (!parent.isDirectory() && !parent.mkdirs()) {
                        throw new IOException("Failed to create directory " + parent);
                    }
                    try (FileOutputStream fos = new FileOutputStream(newFile)) {
                        byte[] buffer = new byte[1024];
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                }
                zipEntry = zis.getNextEntry();
            }
            zis.closeEntry();
        }
    }

    private File newFile(File destinationDir, ZipEntry zipEntry) throws IOException {
        File destFile = new File(destinationDir, zipEntry.getName());
        String destDirPath = destinationDir.getCanonicalPath();
        String destFilePath = destFile.getCanonicalPath();
        if (!destFilePath.startsWith(destDirPath + File.separator)) {
            throw new IOException("Entry is outside of the target dir: " + zipEntry.getName());
        }
        return destFile;
    }

    private void deleteDirectory(Path path) throws IOException {
        Files.walkFileTree(path, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Files.delete(file);
                return FileVisitResult.CONTINUE;
            }
            @Override
            public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                Files.delete(dir);
                return FileVisitResult.CONTINUE;
            }
        });
    }
}
