package com.exaple.codeEditer.Code.Editor.security;

import com.exaple.codeEditer.Code.Editor.entity.AuthProvider;
import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            log.error("Failed to process OAuth2 user", ex);
            throw new org.springframework.security.authentication.InternalAuthenticationServiceException(
                    ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        AuthProvider authProvider = AuthProvider.valueOf(registrationId.toUpperCase());

        String providerId;
        String email;
        String name;
        String avatarUrl;

        if (authProvider == AuthProvider.GOOGLE) {
            providerId = oAuth2User.getAttribute("sub");
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
            avatarUrl = oAuth2User.getAttribute("picture");
        } else if (authProvider == AuthProvider.GITHUB) {
            providerId = String.valueOf(oAuth2User.getAttributes().get("id"));
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
            if (name == null || name.isEmpty()) {
                name = oAuth2User.getAttribute("login");
            }
            avatarUrl = oAuth2User.getAttribute("avatar_url");

            // GitHub might not return email if it's private.
            // In a real prod environment we'd fetch it via github API, but let's assume
            // public for now or fallback.
            if (email == null) {
                email = oAuth2User.getAttribute("login") + "@github.com";
            }
        } else {
            throw new IllegalArgumentException("Sorry! Login with " + registrationId + " is not supported yet.");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (user.getProvider() != authProvider) {
                // User signed up with different provider or local
                log.info("User {} exists, updating provider to {}", email, authProvider);
            }
            user.setProvider(authProvider);
            user.setProviderId(providerId);
            if (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
                user.setAvatarUrl(avatarUrl);
            }
            user = userRepository.save(user);
        } else {
            user = registerNewOAuth2User(authProvider, providerId, name, email, avatarUrl);
        }

        return new CustomOAuth2User(oAuth2User, user);
    }

    private User registerNewOAuth2User(AuthProvider provider, String providerId, String name, String email,
            String avatarUrl) {
        User user = User.builder()
                .username(name != null
                        ? name.replaceAll("\\s+", "").toLowerCase() + "_" + UUID.randomUUID().toString().substring(0, 5)
                        : "user_" + UUID.randomUUID().toString().substring(0, 8))
                .email(email)
                .provider(provider)
                .providerId(providerId)
                .avatarUrl(avatarUrl)
                .passwordHash(UUID.randomUUID().toString()) // Dummy secure password
                .role("ROLE_USER")
                .build();
        return userRepository.save(user);
    }
}
