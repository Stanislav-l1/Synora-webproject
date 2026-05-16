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
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final UserRepository         userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil                jwtUtil;

    @Value("${google.oauth.client-id}")
    private String clientId;

    @Value("${google.oauth.client-secret}")
    private String clientSecret;

    @Value("${app.public-base-url}")
    private String baseUrl;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshExpirationSec;

    @Value("${jwt.access-token-expiration}")
    private long accessExpirationSec;

    private final RestClient restClient = RestClient.create();

    public String buildAuthorizationUrl(String state) {
        String redirectUri = URLEncoder.encode(baseUrl + "/api/v1/auth/oauth/google/callback", StandardCharsets.UTF_8);
        return "https://accounts.google.com/o/oauth2/v2/auth"
                + "?client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&response_type=code"
                + "&scope=openid%20email%20profile"
                + "&state=" + state;
    }

    @Transactional
    public AuthResponse handleCallback(String code) {
        String accessToken = exchangeCodeForToken(code);
        Map<String, Object> profile = fetchProfile(accessToken);

        String googleId  = (String) profile.get("sub");
        String email     = ((String) profile.get("email")).toLowerCase();
        String name      = (String) profile.getOrDefault("name", email.split("@")[0]);
        String picture   = (String) profile.get("picture");

        User user = userRepository.findByGoogleId(googleId).orElseGet(() ->
                userRepository.findByEmail(email).orElseGet(() -> createUser(googleId, email, name, picture))
        );

        boolean changed = false;
        if (user.getGoogleId() == null) { user.setGoogleId(googleId); changed = true; }
        if (!user.isEmailVerified())    { user.setEmailVerified(true); changed = true; }
        if (changed) userRepository.save(user);

        return buildAuthResponse(user);
    }

    private String exchangeCodeForToken(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", baseUrl + "/api/v1/auth/oauth/google/callback");
        form.add("grant_type", "authorization_code");

        Map<String, Object> body = restClient.post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (body == null || !body.containsKey("access_token")) {
            throw new RuntimeException("Failed to obtain Google access token");
        }
        return (String) body.get("access_token");
    }

    private Map<String, Object> fetchProfile(String token) {
        return restClient.get()
                .uri("https://openidconnect.googleapis.com/v1/userinfo")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    private User createUser(String googleId, String email, String name, String picture) {
        String username = ensureUniqueUsername(email.split("@")[0]);
        return userRepository.save(User.builder()
                .googleId(googleId)
                .username(username)
                .email(email)
                .passwordHash(UUID.randomUUID().toString())
                .displayName(name)
                .avatarUrl(picture)
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
