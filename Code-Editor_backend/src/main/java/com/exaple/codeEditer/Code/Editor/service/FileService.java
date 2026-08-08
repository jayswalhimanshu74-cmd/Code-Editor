package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.dto.file.CreateFileRequest;
import com.exaple.codeEditer.Code.Editor.dto.file.FileResponse;
import com.exaple.codeEditer.Code.Editor.dto.file.UpdateFileRequest;
import com.exaple.codeEditer.Code.Editor.entity.File;
import com.exaple.codeEditer.Code.Editor.service.FileEditLogService;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.repository.FileEditLogRepository;
import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.FileRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomMemberRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileService {

    private final FileRepository fileRepository;
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;
    private final FileEditLogService fileEditLogService;
    private final FileEditLogRepository fileEditLogRepository;
    private final PathSecurityService pathSecurityService;

    public List<FileResponse> getFileTree(UUID roomId, String email) {
        Room room = getRoom(roomId);
        checkMembership(room, email);

        List<File> allFiles = fileRepository.findByRoom(room);

        // Group files by parent ID
        java.util.Map<UUID, java.util.List<File>> childrenByParentId = new java.util.HashMap<>();
        java.util.List<File> rootFiles = new java.util.ArrayList<>();

        for (File file : allFiles) {
            if (file.getParent() == null) {
                rootFiles.add(file);
            } else {
                childrenByParentId.computeIfAbsent(file.getParent().getId(), k -> new java.util.ArrayList<>()).add(file);
            }
        }

        return rootFiles.stream()
                .map(file -> toFileResponseWithInMemoryChildren(file, childrenByParentId))
                .toList();
    }

    public FileResponse getFile(UUID roomId, UUID fileId, String email) {
        Room room = getRoom(roomId);
        checkMembership(room, email);

        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new com.exaple.codeEditer.Code.Editor.exception.ResourceNotFoundException("File", "id", fileId));

        if (!file.getRoom().getId().equals(roomId)) {
            throw new com.exaple.codeEditer.Code.Editor.exception.ResourceNotFoundException("File", "id", fileId);
        }

        return toFileResponse(file);
    }

    @Transactional
    public FileResponse createFile(UUID roomId,
            CreateFileRequest request,
            String email) {
        Room room = getRoom(roomId);
        checkMembership(room, email);

        if (!pathSecurityService.isNameSafe(request.getName())) {
            throw new SecurityException("Invalid file name: directory traversal or path separators not allowed");
        }

        File parent = null;
        if (request.getParentId() != null) {
            parent = fileRepository
                    .findById(UUID.fromString(request.getParentId()))
                    .orElseThrow(() -> new RuntimeException("Parent folder not found"));
        }

        File file = File.builder()
                .room(room)
                .name(request.getName())
                .content(request.getContent())
                .language(request.getLanguage())
                .parent(parent)
                .isFolder(request.getIsFolder())
                .build();

        fileRepository.save(file);
        fileEditLogService.logAction(file.getId(), roomId, email, file.getName(), "CREATE");
        return toFileResponse(file);
    }

    @Transactional
    public FileResponse updateFile(UUID roomId,
            UUID fileId,
            UpdateFileRequest request,
            String email) {
        Room room = getRoom(roomId);
        checkMembership(room, email);

        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new com.exaple.codeEditer.Code.Editor.exception.ResourceNotFoundException("File", "id", fileId));

        if (!file.getRoom().getId().equals(roomId)) {
            throw new com.exaple.codeEditer.Code.Editor.exception.ResourceNotFoundException("File", "id", fileId);
        }

        if (request.getName() != null && !pathSecurityService.isNameSafe(request.getName())) {
            throw new SecurityException("Invalid file name: directory traversal or path separators not allowed");
        }

        boolean isRename = request.getName() != null;
        if (request.getName() != null)
            file.setName(request.getName());
        if (request.getContent() != null)
            file.setContent(request.getContent());
        if (request.getLanguage() != null)
            file.setLanguage(request.getLanguage());

        fileRepository.save(file);
        fileEditLogService.logAction(file.getId(), roomId, email, file.getName(), isRename ? "RENAME" : "EDIT");
        return toFileResponse(file);
    }

    @Transactional
    public void deleteFile(UUID roomId, UUID fileId, String email) {
        Room room = getRoom(roomId);
        checkMembership(room, email);
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new com.exaple.codeEditer.Code.Editor.exception.ResourceNotFoundException("File", "id", fileId));

        if (!file.getRoom().getId().equals(roomId)) {
            throw new com.exaple.codeEditer.Code.Editor.exception.ResourceNotFoundException("File", "id", fileId);
        }

        String fileName = file.getName();
        fileEditLogRepository.setFileToNullByFileId(fileId);
        fileRepository.delete(file);
        fileEditLogService.logAction(null, roomId, email, fileName, "DELETE");
    }
    // ── helpers ───────────────────────────────────────────

    private Room getRoom(UUID roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    private void checkMembership(Room room, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!roomMemberRepository.existsByRoomAndUser(room, user)) {
            throw new RuntimeException("Access denied — not a member");
        }
    }

    private FileResponse toFileResponseWithInMemoryChildren(File file, java.util.Map<UUID, java.util.List<File>> childrenByParentId) {
        FileResponse response = toFileResponse(file);

        if (Boolean.TRUE.equals(file.getIsFolder())) {
            java.util.List<File> children = childrenByParentId.getOrDefault(file.getId(), java.util.Collections.emptyList());
            response.setChildren(children.stream()
                    .map(child -> toFileResponseWithInMemoryChildren(child, childrenByParentId))
                    .toList());
        }

        return response;
    }

    private FileResponse toFileResponse(File file) {
        return FileResponse.builder()
                .id(file.getId())
                .name(file.getName())
                .content(file.getContent())
                .language(file.getLanguage())
                .isFolder(file.getIsFolder())
                .parentId(file.getParent() != null
                        ? file.getParent().getId()
                        : null)
                .roomId(file.getRoom().getId())
                .createdAt(file.getCreatedAt())
                .updatedAt(file.getUpdatedAt())
                .build();
    }
}