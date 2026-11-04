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
        boolean emailVerified = false;

        if (authProvider == AuthProvider.GOOGLE) {
            providerId = oAuth2User.getAttribute("sub");
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
            avatarUrl = oAuth2User.getAttribute("picture");
            // Google OIDC includes email_verified claim
            Boolean verified = oAuth2User.getAttribute("email_verified");
            emailVerified = Boolean.TRUE.equals(verified);
        } else if (authProvider == AuthProvider.GITHUB) {
            providerId = String.valueOf(oAuth2User.getAttributes().get("id"));
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
            if (name == null || name.isEmpty()) {
                name = oAuth2User.getAttribute("login");
            }
            avatarUrl = oAuth2User.getAttribute("avatar_url");

            // GitHub might not return email if it's private.
            // Fetch verified primary email via GitHub API.
            if (email == null || email.isBlank()) {
                email = fetchGitHubPrimaryEmail(oAuth2UserRequest.getAccessToken().getTokenValue());
                // fetchGitHubPrimaryEmail only returns verified emails
                emailVerified = (email != null && !email.isBlank());
            } else {
                // Email returned directly from GitHub profile is generally verified
                emailVerified = true;
            }
            if (email == null || email.isBlank()) {
                // Last resort fallback — this email is synthetic and unverified
                email = oAuth2User.getAttribute("login") + "@github.com";
                emailVerified = false;
            }
        } else {
            throw new IllegalArgumentException("Sorry! Login with " + registrationId + " is not supported yet.");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            user = handleExistingUser(user, authProvider, providerId, avatarUrl, emailVerified);
        } else {
            user = registerNewOAuth2User(authProvider, providerId, name, email, avatarUrl);
        }

        return new CustomOAuth2User(oAuth2User, user);
    }

    /**
     * Handles linking/updating for an existing user found by email.
     *
     * Security rules:
     * - If the user's provider already matches, just update the providerId and avatar.
     * - If the user is LOCAL (password account), only link if the OAuth email is verified.
     *   We set the provider to the OAuth provider so future OAuth logins work, but the
     *   password hash is preserved so password login still works.
     * - If the user has a DIFFERENT OAuth provider, allow login if email is verified
     *   (the user owns the email via both providers). Update provider to latest.
     * - If email is NOT verified, refuse to link to prevent account takeover.
     */
    private User handleExistingUser(User user, AuthProvider authProvider, String providerId,
                                     String avatarUrl, boolean emailVerified) {
        if (user.getProvider() == authProvider) {
            // Same provider — just update providerId in case it changed and fill in avatar
            user.setProviderId(providerId);
            if (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
                user.setAvatarUrl(avatarUrl);
            }
            return userRepository.save(user);
        }

        // Different provider — only link if the OAuth email is verified
        if (!emailVerified) {
            log.warn("Refusing to link unverified OAuth email {} to existing account (provider={})",
                    user.getEmail(), user.getProvider());
            throw new org.springframework.security.oauth2.core.OAuth2AuthenticationException(
                    "Cannot link account: email is not verified by the OAuth provider.");
        }

        // Safe to link — user owns this email via a verified OAuth provider
        log.info("Linking user {} from provider {} to OAuth provider {}",
                user.getEmail(), user.getProvider(), authProvider);
        user.setProvider(authProvider);
        user.setProviderId(providerId);
        if (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
            user.setAvatarUrl(avatarUrl);
        }
        // NOTE: passwordHash is intentionally preserved so the user can still log in with password
        return userRepository.save(user);
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

    private String fetchGitHubPrimaryEmail(String accessToken) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.set("Accept", "application/vnd.github+json");
            headers.set("User-Agent", "HenceCode-OAuth");
            org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);

            org.springframework.http.ResponseEntity<java.util.List<java.util.Map<String, Object>>> response = restTemplate.exchange(
                    "https://api.github.com/user/emails",
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    new org.springframework.core.ParameterizedTypeReference<java.util.List<java.util.Map<String, Object>>>() {}
            );

            if (response.getBody() != null) {
                // Only return verified primary email
                for (java.util.Map<String, Object> emailObj : response.getBody()) {
                    Boolean primary = (Boolean) emailObj.get("primary");
                    Boolean verified = (Boolean) emailObj.get("verified");
                    String emailStr = (String) emailObj.get("email");
                    if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified) && emailStr != null) {
                        return emailStr;
                    }
                }
                // Fallback: any verified email
                for (java.util.Map<String, Object> emailObj : response.getBody()) {
                    Boolean verified = (Boolean) emailObj.get("verified");
                    String emailStr = (String) emailObj.get("email");
                    if (Boolean.TRUE.equals(verified) && emailStr != null && !emailStr.isBlank()) {
                        return emailStr;
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to fetch private GitHub email via API: {}", ex.getMessage());
        }
        return null;
    }
}
