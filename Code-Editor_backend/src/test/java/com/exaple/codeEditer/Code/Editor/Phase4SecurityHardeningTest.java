package com.exaple.codeEditer.Code.Editor;

import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import com.exaple.codeEditer.Code.Editor.security.JwtService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class Phase4SecurityHardeningTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User testUser;
    private User adminUser;

    @BeforeEach
    public void setUp() {
        testUser = userRepository.save(User.builder()
                .username("testuser_" + UUID.randomUUID().toString().substring(0, 8))
                .email("user_" + UUID.randomUUID().toString().substring(0, 8) + "@test.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .role("ROLE_USER")
                .build());

        adminUser = userRepository.save(User.builder()
                .username("adminuser_" + UUID.randomUUID().toString().substring(0, 8))
                .email("admin_" + UUID.randomUUID().toString().substring(0, 8) + "@test.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .role("ROLE_ADMIN")
                .build());
    }

    @Test
    public void testUnauthenticatedAccessRejected() throws Exception {
        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testNonAdminAccessToAdminEndpointRejected() throws Exception {
        String userToken = jwtService.generateAccessToken(testUser.getId(), testUser.getEmail());

        mockMvc.perform(get("/api/admin/metrics")
                .cookie(new Cookie("accessToken", userToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testAdminAccessToAdminEndpointAllowed() throws Exception {
        String adminToken = jwtService.generateAccessToken(adminUser.getId(), adminUser.getEmail());

        mockMvc.perform(get("/api/admin/metrics")
                .cookie(new Cookie("accessToken", adminToken)))
                .andExpect(status().isOk());
    }

    @Test
    public void testCookieAuthenticationInJwtAuthFilter() throws Exception {
        String userToken = jwtService.generateAccessToken(testUser.getId(), testUser.getEmail());

        mockMvc.perform(get("/api/rooms")
                .cookie(new Cookie("accessToken", userToken)))
                .andExpect(status().isOk());
    }

    @Test
    public void testLogoutClearsCookies() throws Exception {
        String userToken = jwtService.generateAccessToken(testUser.getId(), testUser.getEmail());

        mockMvc.perform(post("/api/auth/logout")
                .cookie(new Cookie("accessToken", userToken)))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"));
    }
}
