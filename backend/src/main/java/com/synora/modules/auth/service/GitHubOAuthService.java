package com.synora.modules.auth.service;

import com.synora.modules.auth.dto.AuthResponse;
import com.synora.modules.auth.entity.RefreshToken;
import com.synora.modules.auth.repository.RefreshTokenRepository;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.entity.UserRole;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GitHubOAuthService {

    private final UserRepository         userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil                jwtUtil;

    @Value("${github.oauth.client-id}")
    private String clientId;

    @Value("${github.oauth.client-secret}")
    private String clientSecret;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshExpirationSec;

    @Value("${jwt.access-token-expiration}")
    private long accessExpirationSec;

    private final RestClient restClient = RestClient.create();

    public String buildAuthorizationUrl(String state) {
        return "https://github.com/login/oauth/authorize"
                + "?client_id=" + clientId
                + "&scope=user:email"
                + "&state=" + state;
    }

    @Transactional
    public AuthResponse handleCallback(String code) {
        String accessToken = exchangeCodeForToken(code);
        Map<String, Object> profile = fetchProfile(accessToken);
        String email = resolveEmail(accessToken, profile);

        String githubId = String.valueOf(profile.get("id"));
        String login    = (String) profile.get("login");
        String name     = (String) profile.getOrDefault("name", login);
        String avatarUrl = (String) profile.get("avatar_url");
        String githubUrl = "https://github.com/" + login;

        User user = userRepository.findByGithubId(githubId).orElseGet(() ->
                userRepository.findByEmail(email).orElseGet(() -> createUser(githubId, login, email, name, avatarUrl, githubUrl))
        );

        if (user.getGithubId() == null) {
            user.setGithubId(githubId);
            userRepository.save(user);
        }

        return buildAuthResponse(user);
    }

    // --- private ---

    private String exchangeCodeForToken(String code) {
        Map<String, Object> body = restClient.post()
                .uri("https://github.com/login/oauth/access_token")
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .body(Map.of("client_id", clientId, "client_secret", clientSecret, "code", code))
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (body == null || !body.containsKey("access_token")) {
            throw new RuntimeException("Failed to obtain GitHub access token");
        }
        return (String) body.get("access_token");
    }

    private Map<String, Object> fetchProfile(String token) {
        return restClient.get()
                .uri("https://api.github.com/user")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    @SuppressWarnings("unchecked")
    private String resolveEmail(String token, Map<String, Object> profile) {
        String email = (String) profile.get("email");
        if (email != null && !email.isBlank()) return email.toLowerCase();

        List<Map<String, Object>> emails = restClient.get()
                .uri("https://api.github.com/user/emails")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (emails != null) {
            return emails.stream()
                    .filter(e -> Boolean.TRUE.equals(e.get("primary")) && Boolean.TRUE.equals(e.get("verified")))
                    .map(e -> ((String) e.get("email")).toLowerCase())
                    .findFirst()
                    .orElseGet(() -> profile.get("id") + "@github.noemail");
        }
        return profile.get("id") + "@github.noemail";
    }

    private User createUser(String githubId, String login, String email, String name, String avatarUrl, String githubUrl) {
        String username = ensureUniqueUsername(login);
        return userRepository.save(User.builder()
                .githubId(githubId)
                .username(username)
                .email(email)
                .passwordHash(UUID.randomUUID().toString())
                .displayName(name)
                .avatarUrl(avatarUrl)
                .githubUrl(githubUrl)
                .role(UserRole.USER)
                .emailVerified(true)
                .build());
    }

    private String ensureUniqueUsername(String base) {
        String candidate = base.toLowerCase().replaceAll("[^a-z0-9_]", "_");
        if (!userRepository.existsByUsername(candidate)) return candidate;
        for (int i = 2; i < 1000; i++) {
            String next = candidate + i;
            if (!userRepository.existsByUsername(next)) return next;
        }
        return candidate + "_" + UUID.randomUUID().toString().substring(0, 6);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername(), user.getRole().name());
        String rawRefresh  = UUID.randomUUID().toString();
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(rawRefresh)
                .expiresAt(Instant.now().plusSeconds(refreshExpirationSec))
                .build());
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefresh)
                .expiresIn(accessExpirationSec)
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }
}
