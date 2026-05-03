package com.synora.modules.verification.controller;

import com.synora.modules.user.entity.User;
import com.synora.modules.verification.dto.ReviewVerificationRequest;
import com.synora.modules.verification.service.VerificationService;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/verifications")
@RequiredArgsConstructor
@Tag(name = "Admin - Verifications")
@SecurityRequirement(name = "bearerAuth")
public class AdminVerificationController {

    private final VerificationService verificationService;

    @GetMapping
    @Operation(summary = "Get pending verification requests")
    public ResponseEntity<?> getPending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(verificationService.getPending(page, size)));
    }

    @PatchMapping("/{id}/review")
    @Operation(summary = "Approve or reject a verification request")
    public ResponseEntity<?> review(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewVerificationRequest req,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(verificationService.review(id, currentUser, req)));
    }
}
