package com.synora.modules.subscription.controller;

import com.synora.modules.subscription.dto.SubscriptionResponse;
import com.synora.modules.subscription.dto.UpgradeRequest;
import com.synora.modules.subscription.entity.SubscriptionTier;
import com.synora.modules.subscription.service.SubscriptionService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscriptions")
@SecurityRequirement(name = "bearerAuth")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/me")
    @Operation(summary = "Get current subscription")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getCurrent(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(subscriptionService.getCurrent(currentUser.getId())));
    }

    @PostMapping("/upgrade")
    @Operation(summary = "Upgrade subscription tier")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> upgrade(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpgradeRequest req) {
        SubscriptionTier tier;
        try {
            tier = SubscriptionTier.valueOf(req.getTier().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw com.synora.shared.exception.AppException.badRequest("Invalid tier: " + req.getTier());
        }
        return ResponseEntity.ok(ApiResponse.ok(subscriptionService.upgrade(currentUser, tier)));
    }

    @PostMapping("/cancel")
    @Operation(summary = "Cancel current subscription")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> cancel(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(subscriptionService.cancel(currentUser)));
    }
}
