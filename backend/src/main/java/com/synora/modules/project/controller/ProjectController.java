package com.synora.modules.project.controller;

import com.synora.modules.project.dto.*;
import com.synora.modules.project.service.ProjectService;
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
import java.util.UUID;

@Tag(name = "Projects", description = "Project management")
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "List public projects")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProjectSummaryResponse>>> getProjects(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false)    Long   tagId,
            @RequestParam(required = false)    String status) {

        return ResponseEntity.ok(ApiResponse.ok(projectService.getProjects(page, size, tagId, status)));
    }

    @Operation(summary = "Get project by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        UUID userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(projectService.getProject(id, userId)));
    }

    @Operation(summary = "Create a project", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateProjectRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Project created", projectService.createProject(currentUser, req)));
    }

    @Operation(summary = "Update a project", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateProjectRequest req) {

        return ResponseEntity.ok(
                ApiResponse.ok("Project updated", projectService.updateProject(id, currentUser, req)));
    }

    @Operation(summary = "Delete a project", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        projectService.deleteProject(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Join a project", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<Void>> join(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        projectService.joinProject(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Joined project", null));
    }

    @Operation(summary = "Leave a project", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leave(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        projectService.leaveProject(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Left project", null));
    }

    @Operation(summary = "Get project members")
    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<ProjectMemberResponse>>> getMembers(
            @PathVariable UUID id) {

        return ResponseEntity.ok(ApiResponse.ok(projectService.getMembers(id)));
    }

    @Operation(summary = "List projects owned by a user")
    @GetMapping("/by/{username}")
    public ResponseEntity<ApiResponse<PageResponse<ProjectSummaryResponse>>> getByOwner(
            @PathVariable String username,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(projectService.getByOwner(username, page, size)));
    }
}
