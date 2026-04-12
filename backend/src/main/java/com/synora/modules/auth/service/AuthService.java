package com.synora.modules.auth.service;

import com.synora.modules.auth.dto.AuthResponse;
import com.synora.modules.auth.dto.LoginRequest;
import com.synora.modules.auth.dto.RegisterRequest;
import com.synora.modules.auth.entity.RefreshToken;
import com.synora.modules.auth.repository.RefreshTokenRepository;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.entity.UserRole;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.exception.AppException;
import com.synora.shared.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository         userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder        passwordEncoder;
    private final JwtUtil                jwtUtil;

    @Value("${jwt.access-token-expiration}")
    private long accessExpirationSec;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshExpirationSec;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw AppException.conflict("Username already taken: " + req.getUsername());
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw AppException.conflict("Email already registered: " + req.getEmail());
        }

        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .displayName(req.getDisplayName() != null
                        ? req.getDisplayName()
                        : req.getUsername())
                .role(UserRole.USER)
                .build();

        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByUsernameOrEmail(req.getLogin())
                .orElseThrow(() -> AppException.unauthorized("Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw AppException.unauthorized("Invalid credentials");
        }
        if (!user.isEnabled()) {
            throw AppException.unauthorized("Account is disabled");
        }
        if (!user.isAccountNonLocked()) {
            throw AppException.unauthorized("Account is banned");
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken rt = refreshTokenRepository.findByToken(rawRefreshToken)
                .orElseThrow(() -> AppException.unauthorized("Refresh token not found"));

        if (rt.isExpired()) {
            refreshTokenRepository.delete(rt);
            throw AppException.unauthorized("Refresh token expired");
        }

        // Ротация: удаляем старый, выдаём новую пару
        refreshTokenRepository.delete(rt);
        return buildAuthResponse(rt.getUser());
    }

    @Transactional
    public void logout(UUID userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    // --- private ---

    private AuthResponse buildAuthResponse(User user) {
        String accessToken  = jwtUtil.generateAccessToken(
                user.getId(), user.getUsername(), user.getRole().name());
        String refreshToken = generateAndSaveRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(accessExpirationSec)
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    private String generateAndSaveRefreshToken(User user) {
        String tokenValue = UUID.randomUUID().toString();

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(tokenValue)
                .expiresAt(Instant.now().plusSeconds(refreshExpirationSec))
                .build();

        refreshTokenRepository.save(rt);
        return tokenValue;
    }
}
