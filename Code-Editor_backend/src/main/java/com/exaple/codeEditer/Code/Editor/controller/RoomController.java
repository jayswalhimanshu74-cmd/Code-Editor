package com.exaple.codeEditer.Code.Editor.controller;


import com.exaple.codeEditer.Code.Editor.dto.room.CreateRoomRequest;
import com.exaple.codeEditer.Code.Editor.dto.room.JoinRoomRequest;
import com.exaple.codeEditer.Code.Editor.dto.room.RoomResponse;
import com.exaple.codeEditer.Code.Editor.service.RoomService;
import com.exaple.codeEditer.Code.Editor.service.DockerWorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final DockerWorkspaceService dockerWorkspaceService;

    @GetMapping("/{roomId}/ports/{port}")
    public ResponseEntity<Integer> getMappedPort(
            @PathVariable String roomId,
            @PathVariable int port,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer mappedPort = dockerWorkspaceService.getMappedHostPort(roomId, port);
        if (mappedPort != null) {
            return ResponseEntity.ok(mappedPort);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                roomService.createRoom(request, userDetails.getUsername())
        );
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getMyRooms(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                roomService.getMyRooms(userDetails.getUsername())
        );
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoom(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                roomService.getRoom(roomId, userDetails.getUsername())
        );
    }

    @PostMapping("/join")
    public ResponseEntity<RoomResponse> joinRoom(
            @Valid @RequestBody JoinRoomRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                roomService.joinRoom(request, userDetails.getUsername())
        );
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        roomService.deleteRoom(roomId, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}