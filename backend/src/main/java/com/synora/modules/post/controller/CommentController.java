package com.synora.modules.post.controller;

import com.synora.modules.post.dto.CommentResponse;
import com.synora.modules.post.dto.CreateCommentRequest;
import com.synora.modules.post.service.CommentService;
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

@Tag(name = "Comments", description = "Post comments")
@RestController
@RequestMapping("/api/v1/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "Get top-level comments for a post")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CommentResponse>>> getComments(
            @PathVariable UUID postId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(commentService.getComments(postId, page, size)));
    }

    @Operation(summary = "Get replies for a comment")
    @GetMapping("/{commentId}/replies")
    public ResponseEntity<ApiResponse<PageResponse<CommentResponse>>> getReplies(
            @PathVariable UUID postId,
            @PathVariable UUID commentId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(commentService.getReplies(commentId, page, size)));
    }

    @Operation(summary = "Create a comment", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @PathVariable UUID postId,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateCommentRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Comment created",
                        commentService.createComment(postId, currentUser, req)));
    }

    @Operation(summary = "Delete a comment", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable UUID postId,
            @PathVariable UUID commentId,
            @AuthenticationPrincipal User currentUser) {

        commentService.deleteComment(commentId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
