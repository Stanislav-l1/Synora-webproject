package com.synora.modules.user.controller;

import com.synora.modules.user.entity.User;
import com.synora.modules.user.service.FollowService;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Follows")
public class FollowController {

    private final FollowService followService;

    @PostMapping("/{userId}/follow")
    @Operation(summary = "Toggle follow/unfollow user")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> toggleFollow(
            @PathVariable UUID userId,
            @AuthenticationPrincipal User currentUser) {
        boolean followed = followService.toggleFollow(currentUser, userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("following", followed)));
    }

    @GetMapping("/{userId}/followers")
    @Operation(summary = "Get user's followers")
    public ResponseEntity<?> getFollowers(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                followService.getFollowers(userId, page, size)));
    }

    @GetMapping("/{userId}/following")
    @Operation(summary = "Get users that this user follows")
    public ResponseEntity<?> getFollowing(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                followService.getFollowing(userId, page, size)));
    }

    @GetMapping("/{userId}/follow-stats")
    @Operation(summary = "Get follow/following counts")
    public ResponseEntity<?> getFollowStats(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "followers", followService.getFollowersCount(userId),
                "following", followService.getFollowingCount(userId))));
    }

    @GetMapping("/{userId}/is-following")
    @Operation(summary = "Check if current user follows target user")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> isFollowing(
            @PathVariable UUID userId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "following", followService.isFollowing(currentUser.getId(), userId))));
    }
}
