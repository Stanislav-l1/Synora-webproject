package com.synora.modules.admin.controller;

import com.synora.modules.admin.dto.AdminStatsResponse;
import com.synora.modules.admin.service.AdminService;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin - Stats")
@RestController
@RequestMapping("/api/v1/admin/stats")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AdminStatsController {

    private final AdminService adminService;

    @Operation(summary = "Platform-wide stats for admin dashboard")
    @GetMapping
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getStats()));
    }
}
