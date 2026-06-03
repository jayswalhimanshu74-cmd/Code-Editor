package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.dto.log.FileEditLogDTO;
import com.exaple.codeEditer.Code.Editor.service.FileEditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{roomId}")
@RequiredArgsConstructor
public class FileEditLogController {

    private final FileEditLogService logService;

    // All activity in a room — for the room-level log page
    @GetMapping("/logs")
    public ResponseEntity<Page<FileEditLogDTO>> getRoomLogs(
            @PathVariable UUID roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(logService.getRoomLogs(roomId, page, size));
    }

    // All edits to a specific file
    @GetMapping("/files/{fileId}/logs")
    public ResponseEntity<Page<FileEditLogDTO>> getFileLogs(
            @PathVariable UUID roomId,
            @PathVariable UUID fileId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(logService.getFileLogs(fileId, page, size));
    }

    // Filter by user
    @GetMapping("/logs/user/{email}")
    public ResponseEntity<Page<FileEditLogDTO>> getUserLogs(
            @PathVariable UUID roomId,
            @PathVariable String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(logService.getUserLogs(roomId, email, page, size));
    }
}