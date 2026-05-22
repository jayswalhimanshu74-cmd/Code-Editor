package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.dto.room.CreateRoomRequest;
import com.exaple.codeEditer.Code.Editor.dto.room.JoinRoomRequest;
import com.exaple.codeEditer.Code.Editor.dto.room.RoomResponse;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.entity.RoomMember;
import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.RoomMemberRepository;
import com.exaple.codeEditer.Code.Editor.repository.RoomRepository;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;

    // ── Create room ───────────────────────────────────────
    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request, String email) {
        User owner = getUserByEmail(email);

        Room room = Room.builder()
                .name(request.getName())
                .language(request.getLanguage())
                .inviteCode(generateUniqueInviteCode())
                .owner(owner)
                .isActive(true)
                .build();

        roomRepository.save(room);

        // owner is also a member with role 'owner'
        RoomMember member = RoomMember.builder()
                .room(room)
                .user(owner)
                .role("owner")
                .build();

        roomMemberRepository.save(member);

        return toRoomResponse(room);
    }

    // ── Get all rooms user is member of ──────────────────
    @Transactional(readOnly = true)
    public List<RoomResponse> getMyRooms(String email) {
        User user = getUserByEmail(email);

        return roomMemberRepository.findByUser(user)
                .stream()
                .map(rm -> toRoomResponse(rm.getRoom()))
                .toList();
    }

    // ── Get single room ───────────────────────────────────
    @Transactional(readOnly = true)
    public RoomResponse getRoom(UUID roomId, String email) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        User user = getUserByEmail(email);

        // only members can view
        if (!roomMemberRepository.existsByRoomAndUser(room, user)) {
            throw new RuntimeException("Access denied — you are not a member of this room");
        }

        return toRoomResponse(room);
    }

    // ── Join room by invite code ──────────────────────────
    @Transactional
    public RoomResponse joinRoom(JoinRoomRequest request, String email) {

        User user = getUserByEmail(email);

        Room room = roomRepository.findByInviteCode(request.getInviteCode())
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        if (!room.getIsActive()) {
            throw new RuntimeException("This room is no longer active");
        }

        // already a member — just return room info
        if (roomMemberRepository.existsByRoomAndUser(room, user)) {
            return toRoomResponse(room);
        }

        RoomMember member = RoomMember.builder()
                .room(room)
                .user(user)
                .role("editor")
                .build();

        roomMemberRepository.save(member);

        return toRoomResponse(room);
    }

    // ── Delete room (owner only) ──────────────────────────
    @Transactional
    public void deleteRoom(UUID roomId, String email) {
        User user = getUserByEmail(email);

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (!room.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Only the owner can delete this room");
        }

        roomMemberRepository.deleteByRoom(room);
        roomRepository.delete(room);
    }

    // ── Helpers ───────────────────────────────────────────

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private String generateUniqueInviteCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        String code;

        // keep generating until unique
        do {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            code = sb.toString();
        } while (roomRepository.existsByInviteCode(code));

        return code;
    }

    @Transactional(readOnly = true)
    private RoomResponse toRoomResponse(Room room) {
        List<RoomMember> members = roomMemberRepository.findByRoom(room);

        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .inviteCode(room.getInviteCode())
                .language(room.getLanguage())
                .isActive(room.getIsActive())
                .createdAt(room.getCreatedAt())
                .owner(RoomResponse.OwnerDto.builder()
                        .id(room.getOwner().getId())
                        .username(room.getOwner().getUsername())
                        .avatarUrl(room.getOwner().getAvatarUrl())
                        .build())
                .members(members.stream()
                        .map(m -> RoomResponse.MemberDto.builder()
                                .id(m.getUser().getId())
                                .username(m.getUser().getUsername())
                                .avatarUrl(m.getUser().getAvatarUrl())
                                .role(m.getRole())
                                .joinedAt(m.getJoinedAt())
                                .build())
                        .toList())
                .build();
    }
}