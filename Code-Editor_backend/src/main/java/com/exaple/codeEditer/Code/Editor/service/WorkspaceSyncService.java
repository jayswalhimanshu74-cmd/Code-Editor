package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.File;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.repository.FileRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkspaceSyncService {

    private final FileRepository fileRepository;
    private final RoomRepository roomRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final PathSecurityService pathSecurityService;

    private static final String HOST_WORKSPACES_DIR = System.getProperty("user.dir") + "/cloud-workspaces";
    private final Map<String, WatchTask> activeTasks = new ConcurrentHashMap<>();
    private final ExecutorService executorService = Executors.newCachedThreadPool();

    public synchronized void startSyncing(String roomId) {
        if (activeTasks.containsKey(roomId)) {
            return;
        }
        Path workspacePath = Paths.get(HOST_WORKSPACES_DIR, roomId).toAbsolutePath().normalize();
        if (!Files.exists(workspacePath)) {
            try {
                Files.createDirectories(workspacePath);
            } catch (IOException e) {
                log.error("Failed to create workspace directory for syncing: {}", roomId, e);
                return;
            }
        }

        WatchTask task = new WatchTask(roomId, workspacePath);
        activeTasks.put(roomId, task);
        executorService.submit(task);
        log.info("Started filesystem sync task for workspace: {}", roomId);
    }

    public synchronized void stopSyncing(String roomId) {
        WatchTask task = activeTasks.remove(roomId);
        if (task != null) {
            task.stop();
            log.info("Stopped filesystem sync task for workspace: {}", roomId);
        }
    }

    private class WatchTask implements Runnable {
        private final String roomId;
        private final Path rootPath;
        private final WatchService watchService;
        private final Map<WatchKey, Path> keys = new ConcurrentHashMap<>();
        private volatile boolean running = true;
        // Keep track of paths we recently wrote from DB to ignore them in watch
        private final Map<String, String> selfWrittenFileHashes = new ConcurrentHashMap<>();

        public WatchTask(String roomId, Path rootPath) {
            this.roomId = roomId;
            this.rootPath = rootPath;
            try {
                this.watchService = FileSystems.getDefault().newWatchService();
                registerRecursive(rootPath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to initialize WatchService", e);
            }
        }

        private void registerRecursive(Path path) throws IOException {
            Files.walkFileTree(path, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                    if (shouldIgnore(dir)) {
                        return FileVisitResult.SKIP_SUBTREE;
                    }
                    WatchKey key = dir.register(watchService, 
                            StandardWatchEventKinds.ENTRY_CREATE,
                            StandardWatchEventKinds.ENTRY_MODIFY,
                            StandardWatchEventKinds.ENTRY_DELETE);
                    keys.put(key, dir);
                    return FileVisitResult.CONTINUE;
                }
            });
        }

        private boolean shouldIgnore(Path path) {
            String name = path.getFileName().toString();
            return name.equals(".git") || name.equals("node_modules") || name.equals("target") || name.equals("build") || name.equals("dist");
        }

        public void stop() {
            running = false;
            try {
                watchService.close();
            } catch (IOException e) {
                log.error("Error closing watch service", e);
            }
        }

        public void registerNewDirectory(Path dir) {
            try {
                if (!shouldIgnore(dir)) {
                    WatchKey key = dir.register(watchService, 
                            StandardWatchEventKinds.ENTRY_CREATE,
                            StandardWatchEventKinds.ENTRY_MODIFY,
                            StandardWatchEventKinds.ENTRY_DELETE);
                    keys.put(key, dir);
                    log.info("Registered new directory in watcher: {}", dir);
                }
            } catch (IOException e) {
                log.error("Failed to register directory {}", dir, e);
            }
        }

        @Override
        public void run() {
            while (running && !Thread.currentThread().isInterrupted()) {
                WatchKey key;
                try {
                    key = watchService.take();
                } catch (ClosedWatchServiceException e) {
                    break;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }

                Path dir = keys.get(key);
                if (dir == null) {
                    key.reset();
                    continue;
                }

                for (WatchEvent<?> event : key.pollEvents()) {
                    WatchEvent.Kind<?> kind = event.kind();
                    if (kind == StandardWatchEventKinds.OVERFLOW) {
                        continue;
                    }

                    WatchEvent<Path> ev = (WatchEvent<Path>) event;
                    Path filename = ev.context();
                    Path child = dir.resolve(filename).toAbsolutePath().normalize();

                    // Skip ignored paths
                    if (shouldIgnore(child)) {
                        continue;
                    }

                    log.info("Detected change: {} on {}", kind.name(), child);

                    // Process change
                    processChange(kind, child);
                }

                boolean valid = key.reset();
                if (!valid) {
                    keys.remove(key);
                    if (keys.isEmpty()) {
                        break;
                    }
                }
            }
        }

        private void processChange(WatchEvent.Kind<?> kind, Path filePath) {
            try {
                if (kind == StandardWatchEventKinds.ENTRY_CREATE || kind == StandardWatchEventKinds.ENTRY_MODIFY) {
                    if (Files.isDirectory(filePath)) {
                        registerNewDirectory(filePath);
                        syncDirectoryToDatabase(roomId, filePath, false);
                    } else {
                        syncFileToDatabase(roomId, filePath);
                    }
                } else if (kind == StandardWatchEventKinds.ENTRY_DELETE) {
                    syncDeletionToDatabase(roomId, filePath);
                }
            } catch (Exception e) {
                log.error("Error processing sync change for file {}", filePath, e);
            }
        }

        private void syncFileToDatabase(String roomId, Path filePath) {
            try {
                if (!Files.exists(filePath) || Files.isDirectory(filePath)) return;

                String content = Files.readString(filePath, StandardCharsets.UTF_8);
                String currentHash = getMD5Hash(content);

                String relPath = rootPath.relativize(filePath).toString().replace("\\", "/");
                String registeredHash = selfWrittenFileHashes.get(relPath);
                if (registeredHash != null && registeredHash.equals(currentHash)) {
                    log.debug("Skipping self-written file edit for loop prevention: {}", relPath);
                    return;
                }

                updateDatabaseFileContent(roomId, relPath, content);

            } catch (Exception e) {
                log.error("Failed to sync file to database: {}", filePath, e);
            }
        }

        private void syncDirectoryToDatabase(String roomId, Path dirPath, boolean isDelete) {
            try {
                String relPath = rootPath.relativize(dirPath).toString().replace("\\", "/");
                if (!isDelete) {
                    createDatabaseFolder(roomId, relPath);
                }
            } catch (Exception e) {
                log.error("Failed to sync directory to database: {}", dirPath, e);
            }
        }

        private void syncDeletionToDatabase(String roomId, Path filePath) {
            try {
                String relPath = rootPath.relativize(filePath).toString().replace("\\", "/");
                deleteDatabaseFile(roomId, relPath);
            } catch (Exception e) {
                log.error("Failed to sync file deletion to database: {}", filePath, e);
            }
        }
    }

    private String getMD5Hash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : messageDigest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    @Transactional
    public void updateDatabaseFileContent(String roomId, String relativePath, String content) {
        UUID roomUUID = UUID.fromString(roomId);
        Room room = roomRepository.findById(roomUUID).orElse(null);
        if (room == null) return;

        File resolvedFile = resolveFileByPath(room, relativePath, false);
        if (resolvedFile == null) {
            resolvedFile = createDatabaseFileAndHierarchy(room, relativePath, content);
        } else {
            if (!Objects.equals(resolvedFile.getContent(), content)) {
                resolvedFile.setContent(content);
                fileRepository.save(resolvedFile);
            }
        }

        notifyWorkspaceRefresh(roomId);
    }

    @Transactional
    public void createDatabaseFolder(String roomId, String relativePath) {
        UUID roomUUID = UUID.fromString(roomId);
        Room room = roomRepository.findById(roomUUID).orElse(null);
        if (room == null) return;

        resolveFileByPath(room, relativePath, true);
        notifyWorkspaceRefresh(roomId);
    }

    @Transactional
    public void deleteDatabaseFile(String roomId, String relativePath) {
        UUID roomUUID = UUID.fromString(roomId);
        Room room = roomRepository.findById(roomUUID).orElse(null);
        if (room == null) return;

        File file = resolveFileByPath(room, relativePath, null);
        if (file != null) {
            fileRepository.delete(file);
            notifyWorkspaceRefresh(roomId);
        }
    }

    private File resolveFileByPath(Room room, String relativePath, Boolean isFolder) {
        String[] parts = relativePath.split("/");
        File parent = null;
        for (int i = 0; i < parts.length; i++) {
            String part = parts[i];
            boolean isLast = (i == parts.length - 1);
            if (isLast && isFolder != null) {
                Optional<File> f = parent == null 
                    ? fileRepository.findByRoomAndNameAndParentIsNull(room, part)
                    : fileRepository.findByRoomAndNameAndParent(room, part, parent);
                if (f.isPresent()) {
                    return f.get();
                }
                File newFile = File.builder()
                        .room(room)
                        .name(part)
                        .parent(parent)
                        .isFolder(isFolder)
                        .content(isFolder ? null : "")
                        .build();
                return fileRepository.save(newFile);
            } else {
                Optional<File> f = parent == null
                    ? fileRepository.findByRoomAndNameAndParentIsNull(room, part)
                    : fileRepository.findByRoomAndNameAndParent(room, part, parent);
                if (f.isPresent()) {
                    parent = f.get();
                } else {
                    File newDir = File.builder()
                            .room(room)
                            .name(part)
                            .parent(parent)
                            .isFolder(true)
                            .build();
                    parent = fileRepository.save(newDir);
                }
            }
        }
        return parent;
    }

    private File createDatabaseFileAndHierarchy(Room room, String relativePath, String content) {
        String[] parts = relativePath.split("/");
        File parent = null;
        for (int i = 0; i < parts.length; i++) {
            String part = parts[i];
            boolean isLast = (i == parts.length - 1);
            if (isLast) {
                File newFile = File.builder()
                        .room(room)
                        .name(part)
                        .parent(parent)
                        .isFolder(false)
                        .content(content)
                        .build();
                return fileRepository.save(newFile);
            } else {
                Optional<File> f = parent == null
                    ? fileRepository.findByRoomAndNameAndParentIsNull(room, part)
                    : fileRepository.findByRoomAndNameAndParent(room, part, parent);
                if (f.isPresent()) {
                    parent = f.get();
                } else {
                    File newDir = File.builder()
                            .room(room)
                            .name(part)
                            .parent(parent)
                            .isFolder(true)
                            .build();
                    parent = fileRepository.save(newDir);
                }
            }
        }
        return parent;
    }

    private void notifyWorkspaceRefresh(String roomId) {
        try {
            messagingTemplate.convertAndSend("/topic/room/" + roomId + "/files/refresh", Map.of("refresh", true));
        } catch (Exception e) {
            log.error("Failed to notify workspace refresh via WebSocket", e);
        }
    }

    public void writeDbFileToDisk(String roomId, String relativePath, String content) {
        Path filePath = Paths.get(HOST_WORKSPACES_DIR, roomId, relativePath).toAbsolutePath().normalize();
        try {
            if (!pathSecurityService.isNameSafe(filePath.getFileName().toString())) {
                return;
            }
            pathSecurityService.validatePath(Paths.get(HOST_WORKSPACES_DIR, roomId).toAbsolutePath().toString(), filePath.toString());

            WatchTask task = activeTasks.get(roomId);
            if (task != null) {
                task.selfWrittenFileHashes.put(relativePath.replace("\\", "/"), getMD5Hash(content));
            }

            Files.createDirectories(filePath.getParent());
            Files.writeString(filePath, content);
            log.info("Successfully synced database file to disk: {}", relativePath);
        } catch (Exception e) {
            log.error("Failed to write database file to disk path {}", filePath, e);
        }
    }
}
