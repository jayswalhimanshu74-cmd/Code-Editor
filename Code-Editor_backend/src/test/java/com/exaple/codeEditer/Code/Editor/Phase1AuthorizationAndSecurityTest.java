package com.exaple.codeEditer.Code.Editor;

import com.exaple.codeEditer.Code.Editor.dto.RefreshTokenRequest;
import com.exaple.codeEditer.Code.Editor.dto.file.CreateFileRequest;
import com.exaple.codeEditer.Code.Editor.dto.file.FileResponse;
import com.exaple.codeEditer.Code.Editor.dto.file.UpdateFileRequest;
import com.exaple.codeEditer.Code.Editor.dto.room.CreateRoomRequest;
import com.exaple.codeEditer.Code.Editor.dto.room.RoomResponse;
import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.exception.ResourceNotFoundException;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import com.exaple.codeEditer.Code.Editor.security.JwtService;
import com.exaple.codeEditer.Code.Editor.service.AuthService;
import com.exaple.codeEditer.Code.Editor.service.FileService;
import com.exaple.codeEditer.Code.Editor.service.RoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class Phase1AuthorizationAndSecurityTest {

    @Autowired
    private FileService fileService;

    @Autowired
    private RoomService roomService;

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User userA;
    private User userB;
    private RoomResponse roomA;
    private RoomResponse roomB;
    private FileResponse fileA;
    private FileResponse fileB;

    @BeforeEach
    public void setUp() {
        userA = userRepository.save(User.builder()
                .username("user_a_" + UUID.randomUUID().toString().substring(0, 8))
                .email("userA_" + UUID.randomUUID().toString().substring(0, 8) + "@test.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .build());

        userB = userRepository.save(User.builder()
                .username("user_b_" + UUID.randomUUID().toString().substring(0, 8))
                .email("userB_" + UUID.randomUUID().toString().substring(0, 8) + "@test.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .build());

        CreateRoomRequest reqRoomA = new CreateRoomRequest();
        reqRoomA.setName("Room A");
        reqRoomA.setLanguage("javascript");
        roomA = roomService.createRoom(
                reqRoomA,
                userA.getEmail()
        );

        CreateRoomRequest reqRoomB = new CreateRoomRequest();
        reqRoomB.setName("Room B");
        reqRoomB.setLanguage("python");
        roomB = roomService.createRoom(
                reqRoomB,
                userB.getEmail()
        );

        CreateFileRequest reqA = new CreateFileRequest();
        reqA.setName("fileA.js");
        reqA.setContent("console.log('room A');");
        reqA.setLanguage("javascript");
        reqA.setIsFolder(false);
        fileA = fileService.createFile(roomA.getId(), reqA, userA.getEmail());

        CreateFileRequest reqB = new CreateFileRequest();
        reqB.setName("fileB.py");
        reqB.setContent("print('room B')");
        reqB.setLanguage("python");
        reqB.setIsFolder(false);
        fileB = fileService.createFile(roomB.getId(), reqB, userB.getEmail());
    }

    @Test
    public void testCrossRoomIdorInFileService() {
        // Room A owner requesting Room A id + Room B fileId -> must fail with ResourceNotFoundException (404)
        assertThrows(ResourceNotFoundException.class, () -> {
            fileService.getFile(roomA.getId(), fileB.getId(), userA.getEmail());
        });

        // Update file of Room B using Room A id -> must fail
        UpdateFileRequest updateReq = new UpdateFileRequest();
        updateReq.setContent("hacked content");
        assertThrows(ResourceNotFoundException.class, () -> {
            fileService.updateFile(roomA.getId(), fileB.getId(), updateReq, userA.getEmail());
        });

        // Delete file of Room B using Room A id -> must fail
        assertThrows(ResourceNotFoundException.class, () -> {
            fileService.deleteFile(roomA.getId(), fileB.getId(), userA.getEmail());
        });
    }

    @Test
    public void testJwtTokenTypeConfusion() {
        String accessToken = jwtService.generateAccessToken(userA.getId(), userA.getEmail());
        String refreshToken = jwtService.generateRefreshToken(userA.getId(), userA.getEmail());
        String resetToken = jwtService.generatePasswordResetToken(userA.getEmail());

        assertEquals("access", jwtService.extractTokenType(accessToken));
        assertEquals("refresh", jwtService.extractTokenType(refreshToken));
        assertEquals("reset", jwtService.extractTokenType(resetToken));

        // 1. Refresh endpoint rejects access token & reset token
        RefreshTokenRequest refreshWithAccess = new RefreshTokenRequest();
        refreshWithAccess.setRefreshToken(accessToken);
        assertThrows(Exception.class, () -> authService.refresh(refreshWithAccess));

        RefreshTokenRequest refreshWithReset = new RefreshTokenRequest();
        refreshWithReset.setRefreshToken(resetToken);
        assertThrows(Exception.class, () -> authService.refresh(refreshWithReset));

        // 2. Reset password endpoint rejects access token & refresh token
        assertThrows(RuntimeException.class, () -> authService.resetPassword(accessToken, "newPass123!"));
        assertThrows(RuntimeException.class, () -> authService.resetPassword(refreshToken, "newPass123!"));
    }

    @Test
    public void testRoomControllerGetMappedPortAuthorization() {
        // Room A member (userA) accessing roomA mapped port -> succeeds
        Integer port = roomService.getMappedPort(roomA.getId(), 8080, userA.getEmail());
        assertEquals(8080, port);

        // Non-member (userB) accessing roomA mapped port -> fails with RuntimeException
        assertThrows(RuntimeException.class, () -> {
            roomService.getMappedPort(roomA.getId(), 8080, userB.getEmail());
        });
    }
}
