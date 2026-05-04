package com.synora.modules.auth.controller;

import com.synora.modules.auth.dto.*;
import com.synora.modules.auth.service.AuthService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Auth", description = "Authentication endpoints")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a new user")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful", authService.register(req)));
    }

    @Operation(summary = "Login with username/email + password")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.ok("Login successful",
                authService.login(req, resolveIp(httpRequest), httpRequest.getHeader("User-Agent"))));
    }

    @Operation(summary = "Complete login with 2FA code")
    @PostMapping("/2fa/complete")
    public ResponseEntity<ApiResponse<AuthResponse>> complete2FA(
            @Valid @RequestBody TwoFactorCompleteRequest req,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.ok("Login successful",
                authService.complete2FA(req.getTwoFactorToken(), req.getCode(),
                        resolveIp(httpRequest), httpRequest.getHeader("User-Agent"))));
    }

    @Operation(summary = "Refresh access token")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("refreshToken is required", "BAD_REQUEST"));
        }
        return ResponseEntity.ok(ApiResponse.ok(authService.refresh(refreshToken)));
    }

    @Operation(summary = "Logout (invalidate tokens)")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal User user) {
        authService.logout(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Logged out", null));
    }

    @Operation(summary = "Change password")
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(user, req);
        return ResponseEntity.ok(ApiResponse.ok("Password updated", null));
    }

    @Operation(summary = "Get current user info")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> me(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "id",                  user.getId(),
                "username",            user.getUsername(),
                "email",               user.getEmail(),
                "role",                user.getRole(),
                "onboardingCompleted", user.isOnboardingCompleted()
        )));
    }

    private String resolveIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : req.getRemoteAddr();
    }
}
