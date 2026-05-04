package com.synora.modules.security.service;

import com.synora.modules.security.dto.*;
import com.synora.modules.security.entity.LoginHistory;
import com.synora.modules.security.entity.UserSession;
import com.synora.modules.security.repository.LoginHistoryRepository;
import com.synora.modules.security.repository.UserSessionRepository;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SecurityService {

    private final LoginHistoryRepository loginHistoryRepository;
    private final UserSessionRepository  userSessionRepository;
    private final UserRepository         userRepository;
    private final TwoFactorService       twoFactorService;

    // --- Login history ---

    @Async
    @Transactional
    public void logLogin(User user, String ip, String userAgent, boolean success, String failureReason) {
        loginHistoryRepository.save(LoginHistory.builder()
                .user(user)
                .ipAddress(ip)
                .userAgent(userAgent)
                .deviceType(detectDevice(userAgent))
                .success(success)
                .failureReason(failureReason)
                .build());
    }

    @Transactional(readOnly = true)
    public List<LoginHistoryResponse> getLoginHistory(UUID userId) {
        return loginHistoryRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 50))
                .stream()
                .map(h -> LoginHistoryResponse.builder()
                        .id(h.getId())
                        .ipAddress(h.getIpAddress())
                        .deviceType(h.getDeviceType())
                        .success(h.isSuccess())
                        .failureReason(h.getFailureReason())
                        .createdAt(h.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // --- Sessions ---

    @Transactional
    public void createSession(User user, String rawRefreshToken, String ip, String userAgent, Instant expiresAt) {
        userSessionRepository.save(UserSession.builder()
                .user(user)
                .refreshTokenHash(sha256(rawRefreshToken))
                .deviceName(detectDeviceName(userAgent))
                .deviceType(detectDevice(userAgent))
                .ipAddress(ip)
                .userAgent(userAgent)
                .expiresAt(expiresAt)
                .build());
    }

    @Transactional
    public void touchSession(String rawRefreshToken) {
        userSessionRepository.findByRefreshTokenHash(sha256(rawRefreshToken))
                .ifPresent(s -> s.setLastActiveAt(Instant.now()));
    }

    @Transactional(readOnly = true)
    public List<UserSessionResponse> getActiveSessions(UUID userId, String currentTokenHash) {
        Instant now = Instant.now();
        return userSessionRepository
                .findByUserIdAndRevokedFalseAndExpiresAtAfter(userId, now)
                .stream()
                .map(s -> UserSessionResponse.builder()
                        .id(s.getId())
                        .deviceName(s.getDeviceName())
                        .deviceType(s.getDeviceType())
                        .ipAddress(s.getIpAddress())
                        .lastActiveAt(s.getLastActiveAt())
                        .createdAt(s.getCreatedAt())
                        .current(s.getRefreshTokenHash().equals(currentTokenHash))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void revokeSession(UUID sessionId, UUID userId) {
        UserSession s = userSessionRepository.findById(sessionId)
                .orElseThrow(() -> AppException.notFound("Session", sessionId));
        if (!s.getUser().getId().equals(userId)) throw AppException.forbidden();
        s.setRevoked(true);
    }

    @Transactional
    public void revokeAllOtherSessions(UUID userId, UUID currentSessionId) {
        userSessionRepository.revokeAllExcept(userId, currentSessionId);
    }

    @Transactional
    public void revokeAll(UUID userId) {
        userSessionRepository.revokeAll(userId);
    }

    // --- 2FA ---

    @Transactional
    public TwoFactorSetupResponse setup2FA(User user) {
        String secret      = twoFactorService.generateSecret();
        String otpAuthUri  = twoFactorService.buildOtpAuthUri(secret, user.getUsername(), "Synora");
        List<String> codes = twoFactorService.generateBackupCodes();

        user.setTotpSecret(secret);
        user.setTotpBackupCodes(String.join(",", codes));
        userRepository.save(user);

        return TwoFactorSetupResponse.builder()
                .otpAuthUri(otpAuthUri)
                .secret(secret)
                .backupCodes(codes)
                .build();
    }

    @Transactional
    public void enable2FA(User user, String code) {
        if (user.getTotpSecret() == null) throw AppException.badRequest("2FA setup not initiated");
        if (!twoFactorService.verifyCode(user.getTotpSecret(), code)) {
            throw AppException.badRequest("Invalid verification code");
        }
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
    }

    @Transactional
    public void disable2FA(User user, String code) {
        if (!user.isTwoFactorEnabled()) throw AppException.badRequest("2FA is not enabled");
        if (!twoFactorService.verifyCode(user.getTotpSecret(), code) &&
            !verifyBackupCode(user, code)) {
            throw AppException.badRequest("Invalid verification code");
        }
        user.setTwoFactorEnabled(false);
        user.setTotpSecret(null);
        user.setTotpBackupCodes(null);
        userRepository.save(user);
    }

    public boolean verifyTotpOrBackup(User user, String code) {
        if (twoFactorService.verifyCode(user.getTotpSecret(), code)) return true;
        return verifyBackupCode(user, code);
    }

    private boolean verifyBackupCode(User user, String code) {
        if (!twoFactorService.verifyBackupCode(user.getTotpBackupCodes(), code)) return false;
        user.setTotpBackupCodes(
                twoFactorService.removeBackupCode(user.getTotpBackupCodes(), code));
        userRepository.save(user);
        return true;
    }

    // --- Privacy ---

    @Transactional(readOnly = true)
    public PrivacySettingsResponse getPrivacy(User user) {
        return PrivacySettingsResponse.builder()
                .profileVisibility(user.getProfileVisibility())
                .showEmail(user.isShowEmail())
                .showActivity(user.isShowActivity())
                .showOnlineStatus(user.isShowOnlineStatus())
                .build();
    }

    @Transactional
    public PrivacySettingsResponse updatePrivacy(User user, PrivacySettingsRequest req) {
        if (req.getProfileVisibility() != null) user.setProfileVisibility(req.getProfileVisibility());
        if (req.getShowEmail()         != null) user.setShowEmail(req.getShowEmail());
        if (req.getShowActivity()      != null) user.setShowActivity(req.getShowActivity());
        if (req.getShowOnlineStatus()  != null) user.setShowOnlineStatus(req.getShowOnlineStatus());
        userRepository.save(user);
        return getPrivacy(user);
    }

    // --- Dashboard ---

    @Transactional(readOnly = true)
    public SecurityDashboardResponse getDashboard(User user) {
        long activeSessions    = userSessionRepository
                .findByUserIdAndRevokedFalseAndExpiresAtAfter(user.getId(), Instant.now())
                .size();
        long failedLogins24h   = loginHistoryRepository
                .countByUserIdAndSuccessFalseAndCreatedAtAfter(
                        user.getId(), Instant.now().minus(24, ChronoUnit.HOURS));
        return SecurityDashboardResponse.builder()
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .activeSessions(activeSessions)
                .failedLoginsLast24h(failedLogins24h)
                .profilePublic("PUBLIC".equals(user.getProfileVisibility()))
                .build();
    }

    // --- helpers ---

    public String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash      = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String detectDevice(String ua) {
        if (ua == null) return "DESKTOP";
        String u = ua.toLowerCase();
        if (u.contains("mobile") || u.contains("android") || u.contains("iphone")) return "MOBILE";
        if (u.contains("tablet") || u.contains("ipad")) return "TABLET";
        return "DESKTOP";
    }

    private String detectDeviceName(String ua) {
        if (ua == null) return "Unknown device";
        if (ua.toLowerCase().contains("chrome"))  return "Chrome";
        if (ua.toLowerCase().contains("firefox")) return "Firefox";
        if (ua.toLowerCase().contains("safari"))  return "Safari";
        if (ua.toLowerCase().contains("edge"))    return "Edge";
        return "Browser";
    }
}
