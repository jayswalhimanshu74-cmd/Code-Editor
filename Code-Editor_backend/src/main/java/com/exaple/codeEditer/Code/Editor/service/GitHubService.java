package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.User;
import com.exaple.codeEditer.Code.Editor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final com.exaple.codeEditer.Code.Editor.security.GitHubTokenEncryptor githubTokenEncryptor;

    @Value("${github.client.id:}")
    private String clientId;

    @Value("${github.client.secret:}")
    private String clientSecret;

    public void exchangeCodeForToken(User user, String code) {
        if (clientId == null || clientId.isEmpty() || clientSecret == null || clientSecret.isEmpty()) {
            throw new RuntimeException("GitHub OAuth is not configured on the server");
        }

        String url = "https://github.com/login/oauth/access_token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            Map<String, String> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("access_token")) {
                String accessToken = responseBody.get("access_token");
                user.setGithubAccessToken(githubTokenEncryptor.encrypt(accessToken));
                
                // Fetch GitHub Username
                String githubUsername = fetchGitHubUsername(accessToken);
                user.setGithubUsername(githubUsername);

                userRepository.save(user);
                log.info("Successfully connected GitHub account for user: {}", user.getUsername());
            } else {
                throw new RuntimeException("Failed to get access token from GitHub");
            }
        } catch (Exception e) {
            log.error("Error during GitHub OAuth flow", e);
            throw new RuntimeException("GitHub OAuth exchange failed", e);
        }
    }

    private String fetchGitHubUsername(String accessToken) {
        String url = "https://api.github.com/user";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.set("Accept", "application/vnd.github+json");

        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);
        Map<String, Object> body = response.getBody();

        if (body != null && body.containsKey("login")) {
            return (String) body.get("login");
        }
        return null;
    }

    public List<Map<String, Object>> getUserRepositories(User user) {
        if (user.getGithubAccessToken() == null) {
            throw new RuntimeException("User has not connected a GitHub account");
        }

        String url = "https://api.github.com/user/repos?sort=updated&per_page=100";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(githubTokenEncryptor.decrypt(user.getGithubAccessToken()));
        headers.set("Accept", "application/vnd.github+json");

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, request, List.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to fetch repositories for user", e);
            throw new RuntimeException("Failed to fetch repositories");
        }
    }
    
    public void disconnectGitHub(User user) {
        user.setGithubAccessToken(null);
        user.setGithubUsername(null);
        userRepository.save(user);
    }
}
