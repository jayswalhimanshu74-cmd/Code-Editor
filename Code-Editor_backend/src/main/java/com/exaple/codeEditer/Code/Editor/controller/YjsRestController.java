package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.entity.YjsDocument;
import com.exaple.codeEditer.Code.Editor.repository.YjsDocumentRepository;

import java.util.Base64;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/yjs")
public class YjsRestController {

    private final YjsDocumentRepository yjsRepo;

    public YjsRestController(YjsDocumentRepository yjsRepo) {
        this.yjsRepo = yjsRepo;
    }

    // ── Get initial state for main room buffer ────────────────────────────────
    @GetMapping(value = "/{roomId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getRoomState(@PathVariable String roomId) {
        return yjsRepo.findByRoomIdAndFileIdIsNull(roomId)
                .map(doc -> ResponseEntity.ok(Base64.getEncoder().encodeToString(doc.getState())))
                .orElse(ResponseEntity.noContent().build());
    }

    // ── Get initial state for a specific file ─────────────────────────────────
    @GetMapping(value = "/{roomId}/file/{fileId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getFileState(
            @PathVariable String roomId,
            @PathVariable String fileId) {
        return yjsRepo.findByRoomIdAndFileId(roomId, fileId)
                .map(doc -> ResponseEntity.ok(Base64.getEncoder().encodeToString(doc.getState())))
                .orElse(ResponseEntity.noContent().build());
    }

    // ── Delete state when room is deleted ─────────────────────────────────────
    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoomState(@PathVariable String roomId) {
        yjsRepo.deleteAllByRoomId(roomId);
        return ResponseEntity.noContent().build();
    }
}