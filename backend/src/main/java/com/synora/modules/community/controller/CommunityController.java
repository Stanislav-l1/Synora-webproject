package com.synora.modules.community.controller;

import com.synora.modules.community.dto.*;
import com.synora.modules.community.service.CommunityService;
import com.synora.modules.post.dto.PostSummaryResponse;
import com.synora.modules.post.service.PostService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
import com.synora.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Communities", description = "Developer communities, groups and forums")
@RestController
@RequestMapping("/api/v1/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;
    private final PostService       postService;

    @Operation(summary = "List public communities")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CommunityResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q,
            @AuthenticationPrincipal User currentUser) {

        UUID uid = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(communityService.listPublic(page, size, q, uid)));
    }

    @Operation(summary = "My joined communities", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PageResponse<CommunityResponse>>> my(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(
                communityService.myJoined(currentUser.getId(), page, size)));
    }

    @Operation(summary = "Get community by slug")
    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<CommunityResponse>> get(
            @PathVariable String slug,
            @AuthenticationPrincipal User currentUser) {

        UUID uid = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(communityService.getBySlug(slug, uid)));
    }

    @Operation(summary = "Create community", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<ApiResponse<CommunityResponse>> create(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateCommunityRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(communityService.create(currentUser, req)));
    }

    @Operation(summary = "Update community", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/{slug}")
    public ResponseEntity<ApiResponse<CommunityResponse>> update(
            @PathVariable String slug,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateCommunityRequest req) {

        return ResponseEntity.ok(ApiResponse.ok(communityService.update(slug, currentUser, req)));
    }

    @Operation(summary = "Delete community", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{slug}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String slug,
            @AuthenticationPrincipal User currentUser) {

        communityService.delete(slug, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Join community", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{slug}/join")
    public ResponseEntity<ApiResponse<CommunityResponse>> join(
            @PathVariable String slug,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(ApiResponse.ok(communityService.join(slug, currentUser)));
    }

    @Operation(summary = "Leave community", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{slug}/join")
    public ResponseEntity<ApiResponse<Void>> leave(
            @PathVariable String slug,
            @AuthenticationPrincipal User currentUser) {

        communityService.leave(slug, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Get posts in community")
    @GetMapping("/{slug}/posts")
    public ResponseEntity<ApiResponse<PageResponse<PostSummaryResponse>>> posts(
            @PathVariable String slug,
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        UUID uid = currentUser != null ? currentUser.getId() : null;
        var community = communityService.getBySlug(slug, uid);
        return ResponseEntity.ok(ApiResponse.ok(
                postService.getByCommunity(community.getId(), page, size, uid)));
    }

    @Operation(summary = "Get community members")
    @GetMapping("/{slug}/members")
    public ResponseEntity<ApiResponse<PageResponse<CommunityMemberResponse>>> members(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(communityService.getMembers(slug, page, size)));
    }
}
