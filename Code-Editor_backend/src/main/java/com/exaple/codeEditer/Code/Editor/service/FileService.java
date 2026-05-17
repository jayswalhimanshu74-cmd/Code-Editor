package com.exaple.codeEditer.Code.Editor.service;


import com.exaple.codeEditer.Code.Editor.dto.file.CreateFileRequest;
import com.exaple.codeEditer.Code.Editor.dto.file.FileResponse;
import com.exaple.codeEditer.Code.Editor.dto.file.UpdateFileRequest;
import com.exaple.codeEditer.Code.Editor.entity.File;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.FileRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomMemberRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileRepository fileRepository;
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;

    public List<FileResponse> getFileTree(UUID roomId, String email) {
        Room room = getRoom(roomId);
        checkMembership(room, email);

        return fileRepository.findByRoomAndParentIsNull(room)
                .stream()
                .map(this::toFileResponseWithChildren)
                .toList();
    }

    public FileResponse getFile(UUID roomId, UUID fileId, String email) {
        Room room = getRoom(roomId);
        checkMembership(room, email);

        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        return toFileResponse(file);
    }

    @Transactional
    public FileResponse createFile(UUID roomId,
                                   CreateFileRequest request,
                                   String email) {
        Room room = getRoom(roomId);
        checkMembership(room, email);

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
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (request.getName() != null)     file.setName(request.getName());
        if (request.getContent() != null)  file.setContent(request.getContent());
        if (request.getLanguage() != null) file.setLanguage(request.getLanguage());

        fileRepository.save(file);
        return toFileResponse(file);
    }

    @Transactional
    public void deleteFile(UUID roomId, UUID fileId, String email) {
        Room room = getRoom(roomId);
        checkMembership(room, email);

        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        fileRepository.delete(file);
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

    private FileResponse toFileResponseWithChildren(File file) {
        FileResponse response = toFileResponse(file);

        if (Boolean.TRUE.equals(file.getIsFolder())) {
            List<File> children = fileRepository.findByParent(file);
            response.setChildren(children.stream()
                    .map(this::toFileResponseWithChildren)
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
                        ? file.getParent().getId() : null)
                .roomId(file.getRoom().getId())
                .createdAt(file.getCreatedAt())
                .updatedAt(file.getUpdatedAt())
                .build();
    }
}