package com.synora.modules.verification.controller;

import com.synora.modules.user.entity.User;
import com.synora.modules.verification.dto.SubmitVerificationRequest;
import com.synora.modules.verification.service.VerificationService;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/verifications")
@RequiredArgsConstructor
@Tag(name = "Verifications")
@SecurityRequirement(name = "bearerAuth")
public class VerificationController {

    private final VerificationService verificationService;

    @GetMapping("/me")
    @Operation(summary = "Get my current verification request")
    public ResponseEntity<?> getMine(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(verificationService.getCurrent(currentUser.getId())));
    }

    @PostMapping
    @Operation(summary = "Submit a verification request")
    public ResponseEntity<?> submit(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody SubmitVerificationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Verification request submitted", verificationService.submit(currentUser, req)));
    }

    @PostMapping("/cancel")
    @Operation(summary = "Cancel pending verification request")
    public ResponseEntity<?> cancel(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(verificationService.cancel(currentUser)));
    }
}
