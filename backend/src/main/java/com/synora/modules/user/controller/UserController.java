package com.synora.modules.user.controller;

import com.synora.modules.user.dto.UpdateProfileRequest;
import com.synora.modules.user.dto.UserProfileResponse;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.service.UserService;
import com.synora.shared.dto.ApiResponse;
import com.synora.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Users", description = "User profile management")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get user profile by username")
    @GetMapping("/{username}/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @PathVariable String username) {

        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(username)));
    }

    @Operation(summary = "Get user profile by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getById(
            @PathVariable UUID id) {

        return ResponseEntity.ok(ApiResponse.ok(userService.getProfileById(id)));
    }

    @Operation(summary = "Update own profile", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateProfileRequest req) {

        return ResponseEntity.ok(
                ApiResponse.ok("Profile updated", userService.updateProfile(currentUser, req)));
    }

    @Operation(summary = "Top users by reputation")
    @GetMapping("/top")
    public ResponseEntity<ApiResponse<PageResponse<UserProfileResponse>>> topUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(userService.getTopByReputation(page, size)));
    }
}
