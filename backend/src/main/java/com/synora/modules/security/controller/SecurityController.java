package com.synora.modules.security.controller;

import com.synora.modules.security.dto.*;
import com.synora.modules.security.service.SecurityService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Security", description = "Security settings, sessions, 2FA and privacy")
@RestController
@RequestMapping("/api/v1/security")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class SecurityController {

    private final SecurityService securityService;

    @Operation(summary = "Security dashboard overview")
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<SecurityDashboardResponse>> dashboard(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(securityService.getDashboard(user)));
    }

    // --- Sessions ---

    @Operation(summary = "List active sessions")
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<UserSessionResponse>>> sessions(
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        String currentHash = securityService.sha256(extractRefreshToken(request));
        return ResponseEntity.ok(ApiResponse.ok(securityService.getActiveSessions(user.getId(), currentHash)));
    }

    @Operation(summary = "Revoke a specific session")
    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Void>> revokeSession(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        securityService.revokeSession(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Revoke all other sessions")
    @DeleteMapping("/sessions")
    public ResponseEntity<ApiResponse<Void>> revokeOtherSessions(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) Map<String, UUID> body) {
        UUID currentSessionId = body != null ? body.get("currentSessionId") : null;
        if (currentSessionId != null) {
            securityService.revokeAllOtherSessions(user.getId(), currentSessionId);
        }
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // --- Login history ---

    @Operation(summary = "Login history (last 50)")
    @GetMapping("/login-history")
    public ResponseEntity<ApiResponse<List<LoginHistoryResponse>>> loginHistory(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(securityService.getLoginHistory(user.getId())));
    }

    // --- 2FA ---

    @Operation(summary = "Initiate 2FA setup — returns secret + QR URI + backup codes")
    @PostMapping("/2fa/setup")
    public ResponseEntity<ApiResponse<TwoFactorSetupResponse>> setup2FA(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(securityService.setup2FA(user)));
    }

    @Operation(summary = "Enable 2FA after verifying the TOTP code")
    @PostMapping("/2fa/enable")
    public ResponseEntity<ApiResponse<Void>> enable2FA(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        securityService.enable2FA(user, body.get("code"));
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Disable 2FA")
    @DeleteMapping("/2fa")
    public ResponseEntity<ApiResponse<Void>> disable2FA(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        securityService.disable2FA(user, body.get("code"));
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // --- Privacy ---

    @Operation(summary = "Get privacy settings")
    @GetMapping("/privacy")
    public ResponseEntity<ApiResponse<PrivacySettingsResponse>> getPrivacy(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(securityService.getPrivacy(user)));
    }

    @Operation(summary = "Update privacy settings")
    @PutMapping("/privacy")
    public ResponseEntity<ApiResponse<PrivacySettingsResponse>> updatePrivacy(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PrivacySettingsRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(securityService.updatePrivacy(user, req)));
    }

    private String extractRefreshToken(HttpServletRequest request) {
        try {
            String body = new String(request.getInputStream().readAllBytes());
            return body.contains("refreshToken") ? "" : "";
        } catch (Exception e) {
            return "";
        }
    }
}
