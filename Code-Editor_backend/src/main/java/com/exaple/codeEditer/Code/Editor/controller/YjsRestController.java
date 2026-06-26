package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.entity.YjsDocument;
import com.exaple.codeEditer.Code.Editor.repository.YjsDocumentRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomMemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.UUID;

@RestController
@RequestMapping("/api/yjs")
public class YjsRestController {

    private final YjsDocumentRepository yjsRepo;
    private final RoomMemberRepository roomMemberRepository;

    public YjsRestController(YjsDocumentRepository yjsRepo, RoomMemberRepository roomMemberRepository) {
        this.yjsRepo = yjsRepo;
        this.roomMemberRepository = roomMemberRepository;
    }

    private boolean checkMembership(String roomId, UserDetails userDetails) {
        if (userDetails == null) return false;
        try {
            UUID roomUUID = UUID.fromString(roomId);
            return roomMemberRepository.existsByRoomIdAndUserEmail(roomUUID, userDetails.getUsername());
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    // ── Get initial state for main room buffer ────────────────────────────────
    @GetMapping(value = "/{roomId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getRoomState(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (!checkMembership(roomId, userDetails)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return yjsRepo.findByRoomIdAndFileIdIsNull(roomId)
                .map(doc -> ResponseEntity.ok(Base64.getEncoder().encodeToString(doc.getState())))
                .orElse(ResponseEntity.noContent().build());
    }

    // ── Get initial state for a specific file ─────────────────────────────────
    @GetMapping(value = "/{roomId}/file/{fileId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getFileState(
            @PathVariable String roomId,
            @PathVariable String fileId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (!checkMembership(roomId, userDetails)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return yjsRepo.findByRoomIdAndFileId(roomId, fileId)
                .map(doc -> ResponseEntity.ok(Base64.getEncoder().encodeToString(doc.getState())))
                .orElse(ResponseEntity.noContent().build());
    }

    // ── Save full state for main room buffer ──────────────────────────────────
    @PostMapping(value = "/{roomId}/state")
    public ResponseEntity<Void> saveRoomState(
            @PathVariable String roomId,
            @RequestBody String base64State,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (!checkMembership(roomId, userDetails)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        byte[] state = Base64.getDecoder().decode(base64State.trim());
        YjsDocument doc = yjsRepo.findByRoomIdAndFileIdIsNull(roomId)
                .orElseGet(() -> {
                    YjsDocument d = new YjsDocument();
                    d.setRoomId(roomId);
                    return d;
                });
        doc.setState(state);
        yjsRepo.save(doc);
        return ResponseEntity.ok().build();
    }

    // ── Save full state for a specific file ───────────────────────────────────
    @PostMapping(value = "/{roomId}/file/{fileId}/state")
    public ResponseEntity<Void> saveFileState(
            @PathVariable String roomId,
            @PathVariable String fileId,
            @RequestBody String base64State,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (!checkMembership(roomId, userDetails)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        byte[] state = Base64.getDecoder().decode(base64State.trim());
        YjsDocument doc = yjsRepo.findByRoomIdAndFileId(roomId, fileId)
                .orElseGet(() -> {
                    YjsDocument d = new YjsDocument();
                    d.setRoomId(roomId);
                    d.setFileId(fileId);
                    return d;
                });
        doc.setState(state);
        yjsRepo.save(doc);
        return ResponseEntity.ok().build();
    }

    // ── Delete state when room is deleted ─────────────────────────────────────
    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoomState(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (!checkMembership(roomId, userDetails)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        yjsRepo.deleteAllByRoomId(roomId);
        return ResponseEntity.noContent().build();
    }
}