package com.synora.modules.push.controller;

import com.synora.modules.push.dto.SubscribePushRequest;
import com.synora.modules.push.service.PushNotificationService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Push Notifications")
@RestController
@RequestMapping("/api/v1/push")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class PushSubscriptionController {

    private final PushNotificationService pushService;

    @GetMapping("/vapid-public-key")
    @Operation(summary = "Get VAPID public key for push subscription")
    public ApiResponse<Map<String, String>> getVapidPublicKey() {
        return ApiResponse.ok(Map.of("publicKey", pushService.getVapidPublicKey()));
    }

    @PostMapping("/subscribe")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Subscribe to push notifications")
    public ApiResponse<Void> subscribe(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody SubscribePushRequest req
    ) {
        pushService.subscribe(currentUser.getId(), currentUser,
                req.getEndpoint(), req.getP256dh(), req.getAuth());
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/unsubscribe")
    @Operation(summary = "Unsubscribe from push notifications")
    public ApiResponse<Void> unsubscribe(
            @AuthenticationPrincipal User currentUser,
            @RequestParam String endpoint
    ) {
        pushService.unsubscribe(currentUser.getId(), endpoint);
        return ApiResponse.ok(null);
    }
}
