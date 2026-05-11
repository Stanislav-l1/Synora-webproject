package com.synora.modules.auth.service;

import com.synora.modules.auth.dto.AuthResponse;
import com.synora.modules.auth.dto.ChangePasswordRequest;
import com.synora.modules.auth.dto.ForgotPasswordRequest;
import com.synora.modules.auth.dto.LoginRequest;
import com.synora.modules.auth.dto.RegisterRequest;
import com.synora.modules.auth.dto.ResetPasswordRequest;
import com.synora.modules.auth.entity.RefreshToken;
import com.synora.modules.auth.repository.RefreshTokenRepository;
import com.synora.modules.security.service.SecurityService;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.entity.UserRole;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.exception.AppException;
import com.synora.shared.util.JwtUtil;
import io.micrometer.core.instrument.Counter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository         userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder        passwordEncoder;
    private final JwtUtil                jwtUtil;
    private final SecurityService        securityService;
    private final StringRedisTemplate    redis;
    private final Counter                userRegistrations;
    private final Counter                authFailures;

    private static final String TWO_FA_PREFIX = "2fa:pending:";

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
                .displayName(req.getDisplayName() != null ? req.getDisplayName() : req.getUsername())
                .role(UserRole.USER)
                .build();

        user = userRepository.save(user);
        userRegistrations.increment();
        return buildAuthResponse(user, null, null);
    }

    @Transactional
    public AuthResponse login(LoginRequest req, String ip, String userAgent) {
        User user = userRepository.findByUsernameOrEmail(req.getLogin())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            if (user != null) {
                securityService.logLogin(user, ip, userAgent, false, "Invalid credentials");
            }
            authFailures.increment();
            throw AppException.unauthorized("Invalid credentials");
        }
        if (!user.isEnabled()) {
            securityService.logLogin(user, ip, userAgent, false, "Account disabled");
            throw AppException.unauthorized("Account is disabled");
        }
        if (!user.isAccountNonLocked()) {
            securityService.logLogin(user, ip, userAgent, false, "Account banned");
            throw AppException.unauthorized("Account is banned");
        }

        securityService.logLogin(user, ip, userAgent, true, null);

        if (user.isTwoFactorEnabled()) {
            String token = UUID.randomUUID().toString();
            redis.opsForValue().set(TWO_FA_PREFIX + token, user.getId().toString(), Duration.ofMinutes(5));
            return AuthResponse.builder()
                    .requiresTwoFactor(true)
                    .twoFactorToken(token)
                    .build();
        }

        return buildAuthResponse(user, ip, userAgent);
    }

    @Transactional
    public AuthResponse complete2FA(String twoFactorToken, String code, String ip, String userAgent) {
        String userIdStr = redis.opsForValue().get(TWO_FA_PREFIX + twoFactorToken);
        if (userIdStr == null) throw AppException.unauthorized("2FA session expired or invalid");

        User user = userRepository.findById(UUID.fromString(userIdStr))
                .orElseThrow(() -> AppException.unauthorized("User not found"));

        if (!securityService.verifyTotpOrBackup(user, code)) {
            throw AppException.unauthorized("Invalid 2FA code");
        }

        redis.delete(TWO_FA_PREFIX + twoFactorToken);
        return buildAuthResponse(user, ip, userAgent);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken rt = refreshTokenRepository.findByToken(rawRefreshToken)
                .orElseThrow(() -> AppException.unauthorized("Refresh token not found"));

        if (rt.isExpired()) {
            refreshTokenRepository.delete(rt);
            throw AppException.unauthorized("Refresh token expired");
        }

        securityService.touchSession(rawRefreshToken);
        refreshTokenRepository.delete(rt);
        return buildAuthResponse(rt.getUser(), null, null);
    }

    @Transactional
    public void logout(UUID userId) {
        refreshTokenRepository.deleteByUserId(userId);
        securityService.revokeAll(userId);
    }

    private static final String RESET_PREFIX = "pwd:reset:";

    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        userRepository.findByEmail(req.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString().replace("-", "");
            redis.opsForValue().set(RESET_PREFIX + token, user.getId().toString(), Duration.ofHours(1));
            // TODO: send email with reset link: /reset-password?token={token}
            org.slf4j.LoggerFactory.getLogger(AuthService.class)
                .info("Password reset token for {}: {}", user.getEmail(), token);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        String key = RESET_PREFIX + req.getToken();
        String userId = redis.opsForValue().get(key);
        if (userId == null) throw AppException.badRequest("Invalid or expired reset token");
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> AppException.notFound("User", userId));
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        refreshTokenRepository.deleteByUserId(user.getId());
        redis.delete(key);
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest req) {
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw AppException.badRequest("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        refreshTokenRepository.deleteByUserId(user.getId());
    }

    // --- private ---

    private AuthResponse buildAuthResponse(User user, String ip, String userAgent) {
        String accessToken   = jwtUtil.generateAccessToken(user.getId(), user.getUsername(), user.getRole().name());
        String rawRefresh    = generateAndSaveRefreshToken(user);
        Instant expiresAt    = Instant.now().plusSeconds(refreshExpirationSec);

        if (ip != null) {
            securityService.createSession(user, rawRefresh, ip, userAgent, expiresAt);
        }

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefresh)
                .expiresIn(accessExpirationSec)
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    private String generateAndSaveRefreshToken(User user) {
        String tokenValue = UUID.randomUUID().toString();
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(tokenValue)
                .expiresAt(Instant.now().plusSeconds(refreshExpirationSec))
                .build());
        return tokenValue;
    }
}
