package com.synora.modules.post.controller;

import com.synora.modules.post.dto.*;
import com.synora.modules.post.entity.ReactionType;
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
            @RequestParam(required = false)    Long tagId,
            @AuthenticationPrincipal User currentUser) {

        UUID uid = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(postService.getFeed(page, size, tagId, uid)));
    }

    @Operation(summary = "Get saved (bookmarked) posts", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<PageResponse<PostSummaryResponse>>> getSaved(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(postService.getSaved(currentUser.getId(), page, size)));
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

        boolean liked = postService.toggleLike(id, currentUser);
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

    @Operation(summary = "Set reaction on a post", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}/reaction")
    public ResponseEntity<ApiResponse<String>> setReaction(
            @PathVariable UUID id,
            @RequestParam ReactionType type,
            @AuthenticationPrincipal User currentUser) {

        ReactionType result = postService.setReaction(id, currentUser, type);
        return ResponseEntity.ok(ApiResponse.ok("Reaction set", result.name()));
    }

    @Operation(summary = "Clear reaction on a post", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}/reaction")
    public ResponseEntity<ApiResponse<Void>> clearReaction(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        postService.clearReaction(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Toggle hide post from feed", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{id}/hide")
    public ResponseEntity<ApiResponse<Boolean>> toggleHide(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        boolean hidden = postService.toggleHide(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(hidden ? "Hidden" : "Unhidden", hidden));
    }

    @Operation(summary = "Repost a post", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{id}/repost")
    public ResponseEntity<ApiResponse<PostResponse>> repost(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Reposted", postService.repost(id, currentUser)));
    }

    @Operation(summary = "Toggle pin on a post (owner only)", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{id}/pin")
    public ResponseEntity<ApiResponse<Boolean>> togglePin(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        boolean pinned = postService.togglePin(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(pinned ? "Pinned" : "Unpinned", pinned));
    }

    @Operation(summary = "Get posts by author username")
    @GetMapping("/by/{username}")
    public ResponseEntity<ApiResponse<PageResponse<PostSummaryResponse>>> getByAuthor(
            @PathVariable String username,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {

        UUID uid = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(postService.getByAuthor(username, page, size, uid)));
    }
}
