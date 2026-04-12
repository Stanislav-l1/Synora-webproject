package com.synora.modules.post.controller;

import com.synora.modules.post.dto.*;
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

@Tag(name = "Posts", description = "Posts feed and management")
@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @Operation(summary = "Get paginated feed")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PostSummaryResponse>>> getFeed(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false)    Long tagId) {

        return ResponseEntity.ok(ApiResponse.ok(postService.getFeed(page, size, tagId)));
    }

    @Operation(summary = "Get post by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(postService.getPost(id, userId)));
    }

    @Operation(summary = "Create a post", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreatePostRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Post created", postService.createPost(currentUser, req)));
    }

    @Operation(summary = "Update a post", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdatePostRequest req) {

        return ResponseEntity.ok(
                ApiResponse.ok("Post updated", postService.updatePost(id, currentUser, req)));
    }

    @Operation(summary = "Delete a post", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        postService.deletePost(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Toggle like on a post", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Boolean>> toggleLike(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        boolean liked = postService.toggleLike(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(liked ? "Liked" : "Unliked", liked));
    }

    @Operation(summary = "Toggle bookmark on a post", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<Boolean>> toggleBookmark(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        boolean bookmarked = postService.toggleBookmark(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(bookmarked ? "Bookmarked" : "Removed from bookmarks", bookmarked));
    }

    @Operation(summary = "Get posts by author username")
    @GetMapping("/by/{username}")
    public ResponseEntity<ApiResponse<PageResponse<PostSummaryResponse>>> getByAuthor(
            @PathVariable String username,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(postService.getByAuthor(username, page, size)));
    }
}
