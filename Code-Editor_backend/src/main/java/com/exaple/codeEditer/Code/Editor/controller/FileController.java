package com.exaple.codeEditer.Code.Editor.controller;


import com.exaple.codeEditer.Code.Editor.dto.file.CreateFileRequest;
import com.exaple.codeEditer.Code.Editor.dto.file.FileResponse;
import com.exaple.codeEditer.Code.Editor.dto.file.UpdateFileRequest;
import com.exaple.codeEditer.Code.Editor.service.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{roomId}/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @GetMapping
    public ResponseEntity<List<FileResponse>> getFileTree(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                fileService.getFileTree(roomId, userDetails.getUsername())
        );
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<FileResponse> getFile(
            @PathVariable UUID roomId,
            @PathVariable UUID fileId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                fileService.getFile(roomId, fileId, userDetails.getUsername())
        );
    }

    @PostMapping
    public ResponseEntity<FileResponse> createFile(
            @PathVariable UUID roomId,
            @Valid @RequestBody CreateFileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                fileService.createFile(roomId, request, userDetails.getUsername())
        );
    }

    @PutMapping("/{fileId}")
    public ResponseEntity<FileResponse> updateFile(
            @PathVariable UUID roomId,
            @PathVariable UUID fileId,
            @RequestBody UpdateFileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                fileService.updateFile(
                        roomId, fileId, request, userDetails.getUsername())
        );
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(
            @PathVariable UUID roomId,
            @PathVariable UUID fileId,
            @AuthenticationPrincipal UserDetails userDetails) {
        fileService.deleteFile(roomId, fileId, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}
