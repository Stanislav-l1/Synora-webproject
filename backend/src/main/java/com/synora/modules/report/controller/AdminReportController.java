package com.synora.modules.report.controller;

import com.synora.modules.report.entity.ReportStatus;
import com.synora.modules.report.service.ReportService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Admin - Reports")
@SecurityRequirement(name = "bearerAuth")
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping
    @Operation(summary = "Get all reports")
    public ResponseEntity<?> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                reportService.getAllReports(page, size)));
    }

    @GetMapping("/by-status")
    @Operation(summary = "Get reports by status")
    public ResponseEntity<?> getByStatus(
            @RequestParam ReportStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                reportService.getReportsByStatus(status, page, size)));
    }

    @PatchMapping("/{id}/review")
    @Operation(summary = "Review a report (change status)")
    public ResponseEntity<?> reviewReport(
            @PathVariable Long id,
            @RequestParam ReportStatus status,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(
                reportService.reviewReport(id, currentUser, status)));
    }
}
