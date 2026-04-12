package com.synora.modules.project.controller;

import com.synora.modules.project.dto.*;
import com.synora.modules.project.service.TaskService;
import com.synora.modules.user.entity.User;
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

import java.util.UUID;

@Tag(name = "Tasks & Kanban", description = "Kanban board and task management")
@RestController
@RequestMapping("/api/v1/projects/{projectId}")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "Get full Kanban board", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/board")
    public ResponseEntity<ApiResponse<KanbanBoardResponse>> getBoard(
            @PathVariable UUID projectId) {

        return ResponseEntity.ok(ApiResponse.ok(taskService.getBoard(projectId)));
    }

    @Operation(summary = "Create a task", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateTaskRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Task created",
                        taskService.createTask(projectId, currentUser, req)));
    }

    @Operation(summary = "Update a task", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateTaskRequest req) {

        return ResponseEntity.ok(
                ApiResponse.ok("Task updated", taskService.updateTask(taskId, currentUser, req)));
    }

    @Operation(summary = "Move task to a different column", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/tasks/{taskId}/move")
    public ResponseEntity<ApiResponse<TaskResponse>> moveTask(
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @AuthenticationPrincipal User currentUser,
            @RequestBody MoveTaskRequest req) {

        return ResponseEntity.ok(
                ApiResponse.ok("Task moved", taskService.moveTask(taskId, currentUser, req)));
    }

    @Operation(summary = "Delete a task", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable UUID projectId,
            @PathVariable UUID taskId,
            @AuthenticationPrincipal User currentUser) {

        taskService.deleteTask(taskId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Add a Kanban column", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/columns")
    public ResponseEntity<ApiResponse<KanbanColumnResponse>> createColumn(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateKanbanColumnRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Column created",
                        taskService.createColumn(projectId, currentUser, req)));
    }

    @Operation(summary = "Delete a Kanban column", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/columns/{columnId}")
    public ResponseEntity<ApiResponse<Void>> deleteColumn(
            @PathVariable UUID projectId,
            @PathVariable Long columnId,
            @AuthenticationPrincipal User currentUser) {

        taskService.deleteColumn(columnId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
