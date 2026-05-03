package com.synora.modules.git.controller;

import com.synora.modules.git.dto.*;
import com.synora.modules.git.entity.GitProvider;
import com.synora.modules.git.service.GitService;
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

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Git Repositories", description = "GitHub/GitLab repository showcase and contribution graph")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class GitController {

    private final GitService gitService;

    @Operation(summary = "Get user repositories")
    @GetMapping("/users/{userId}/repos")
    public ResponseEntity<ApiResponse<List<GitRepoResponse>>> getUserRepos(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(ApiResponse.ok(gitService.getUserRepos(userId)));
    }

    @Operation(summary = "Get user repositories paginated")
    @GetMapping("/users/{userId}/repos/page")
    public ResponseEntity<ApiResponse<PageResponse<GitRepoResponse>>> getUserReposPaged(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(gitService.getUserReposPaged(userId, page, size)));
    }

    @Operation(summary = "Get featured repos for user")
    @GetMapping("/users/{userId}/repos/featured")
    public ResponseEntity<ApiResponse<List<GitRepoResponse>>> getFeatured(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(ApiResponse.ok(gitService.getFeaturedRepos(userId)));
    }

    @Operation(summary = "Get contribution graph data for user")
    @GetMapping("/users/{userId}/contributions")
    public ResponseEntity<ApiResponse<List<ContributionDataResponse>>> getContributions(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(ApiResponse.ok(gitService.getContributions(userId)));
    }

    @Operation(summary = "Import a repository", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/repos")
    public ResponseEntity<ApiResponse<GitRepoResponse>> importRepo(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ImportRepoRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(gitService.importRepo(currentUser, req)));
    }

    @Operation(summary = "Sync/update repository data", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/repos/{id}")
    public ResponseEntity<ApiResponse<GitRepoResponse>> syncRepo(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ImportRepoRequest req) {

        return ResponseEntity.ok(ApiResponse.ok(gitService.syncRepo(id, currentUser, req)));
    }

    @Operation(summary = "Toggle repository featured status", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/repos/{id}/feature")
    public ResponseEntity<ApiResponse<GitRepoResponse>> toggleFeatured(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(ApiResponse.ok(gitService.toggleFeatured(id, currentUser)));
    }

    @Operation(summary = "Delete imported repository", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/repos/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRepo(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        gitService.deleteRepo(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Save contribution data (from client-side OAuth flow)", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/contributions")
    public ResponseEntity<ApiResponse<ContributionDataResponse>> saveContributions(
            @AuthenticationPrincipal User currentUser,
            @RequestParam GitProvider provider,
            @RequestParam short year,
            @RequestBody Map<String, Integer> data) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(gitService.saveContributions(currentUser, provider, year, data)));
    }
}
