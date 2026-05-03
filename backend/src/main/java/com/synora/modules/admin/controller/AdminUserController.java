package com.synora.modules.admin.controller;

import com.synora.modules.admin.dto.AdminUserResponse;
import com.synora.modules.admin.dto.BanUserRequest;
import com.synora.modules.admin.dto.ChangeRoleRequest;
import com.synora.modules.admin.service.AdminService;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.entity.UserRole;
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

@Tag(name = "Admin - Users")
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AdminUserController {

    private final AdminService adminService;

    @Operation(summary = "List all users (search, filter)")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminUserResponse>>> listUsers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Boolean banned,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "30") int size) {

        return ResponseEntity.ok(ApiResponse.ok(
                adminService.listUsers(q, role, banned, page, size)));
    }

    @Operation(summary = "Get single user")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getUser(id)));
    }

    @Operation(summary = "Ban a user")
    @PostMapping("/{id}/ban")
    public ResponseEntity<ApiResponse<AdminUserResponse>> banUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody(required = false) BanUserRequest req) {

        String reason = req != null ? req.getReason() : null;
        return ResponseEntity.ok(ApiResponse.ok(
                adminService.banUser(id, admin.getId(), reason)));
    }

    @Operation(summary = "Unban a user")
    @PostMapping("/{id}/unban")
    public ResponseEntity<ApiResponse<AdminUserResponse>> unbanUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.unbanUser(id)));
    }

    @Operation(summary = "Change user role")
    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<AdminUserResponse>> changeRole(
            @PathVariable UUID id,
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody ChangeRoleRequest req) {

        return ResponseEntity.ok(ApiResponse.ok(
                adminService.changeRole(id, admin.getId(), req.getRole())));
    }

    @Operation(summary = "Deactivate a user account")
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<AdminUserResponse>> deactivate(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.setActive(id, false)));
    }

    @Operation(summary = "Reactivate a user account")
    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<AdminUserResponse>> activate(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.setActive(id, true)));
    }
}
