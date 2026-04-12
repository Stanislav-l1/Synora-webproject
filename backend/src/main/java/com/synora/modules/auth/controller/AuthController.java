package com.synora.modules.auth.controller;

import com.synora.modules.auth.dto.AuthResponse;
import com.synora.modules.auth.dto.LoginRequest;
import com.synora.modules.auth.dto.RegisterRequest;
import com.synora.modules.auth.service.AuthService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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

        AuthResponse response = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful", response));
    }

    @Operation(summary = "Login with username/email + password")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest req) {

        AuthResponse response = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
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

        AuthResponse response = authService.refresh(refreshToken);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "Logout (invalidate refresh tokens)")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal User user) {

        authService.logout(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Logged out", null));
    }

    @Operation(summary = "Get current user info")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> me(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "id",       user.getId(),
                "username", user.getUsername(),
                "email",    user.getEmail(),
                "role",     user.getRole()
        )));
    }
}
