package com.synora.modules.project.service;

import com.synora.modules.project.dto.*;
import com.synora.modules.project.entity.*;
import com.synora.modules.project.repository.*;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository          taskRepository;
    private final KanbanColumnRepository  columnRepository;
    private final ProjectRepository       projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository          userRepository;

    @Transactional(readOnly = true)
    public KanbanBoardResponse getBoard(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> AppException.notFound("Project", projectId));

        List<KanbanColumn> columns = columnRepository.findByProjectIdOrderByOrderIndex(projectId);
        List<KanbanColumnResponse> columnResponses = columns.stream()
                .map(col -> KanbanColumnResponse.builder()
                        .id(col.getId())
                        .name(col.getName())
                        .color(col.getColor())
                        .orderIndex(col.getOrderIndex())
                        .wipLimit(col.getWipLimit())
                        .tasks(taskRepository
                                .findByProjectIdAndColumnIdOrderByOrderIndex(projectId, col.getId())
                                .stream().map(this::toResponse).toList())
                        .build())
                .toList();

        return KanbanBoardResponse.builder()
                .projectId(projectId)
                .projectName(project.getName())
                .columns(columnResponses)
                .build();
    }

    @Transactional
    public TaskResponse createTask(UUID projectId, User reporter, CreateTaskRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> AppException.notFound("Project", projectId));

        checkIsMember(projectId, reporter.getId());

        KanbanColumn column = null;
        if (req.getColumnId() != null) {
            column = columnRepository.findById(req.getColumnId())
                    .orElseThrow(() -> AppException.notFound("KanbanColumn", req.getColumnId()));
        }

        User assignee = null;
        if (req.getAssigneeId() != null) {
            assignee = userRepository.findById(req.getAssigneeId())
                    .orElseThrow(() -> AppException.notFound("User", req.getAssigneeId()));
        }

        Task task = Task.builder()
                .project(project)
                .column(column)
                .reporter(reporter)
                .assignee(assignee)
                .title(req.getTitle())
                .description(req.getDescription())
                .status(req.getStatus() != null ? req.getStatus() : TaskStatus.TODO)
                .priority(req.getPriority() != null ? req.getPriority() : TaskPriority.MEDIUM)
                .dueDate(req.getDueDate())
                .storyPoints(req.getStoryPoints())
                .build();

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(UUID id, User currentUser, UpdateTaskRequest req) {
        Task task = findOrThrow(id);
        checkIsMember(task.getProject().getId(), currentUser.getId());

        if (req.getTitle()       != null) task.setTitle(req.getTitle());
        if (req.getDescription() != null) task.setDescription(req.getDescription());
        if (req.getStatus()      != null) task.setStatus(req.getStatus());
        if (req.getPriority()    != null) task.setPriority(req.getPriority());
        if (req.getDueDate()     != null) task.setDueDate(req.getDueDate());
        if (req.getStoryPoints() != null) task.setStoryPoints(req.getStoryPoints());
        if (req.getAssigneeId()  != null) {
            User assignee = userRepository.findById(req.getAssigneeId())
                    .orElseThrow(() -> AppException.notFound("User", req.getAssigneeId()));
            task.setAssignee(assignee);
        }

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse moveTask(UUID id, User currentUser, MoveTaskRequest req) {
        Task task = findOrThrow(id);
        checkIsMember(task.getProject().getId(), currentUser.getId());

        KanbanColumn column = null;
        if (req.getColumnId() != null) {
            column = columnRepository.findById(req.getColumnId())
                    .orElseThrow(() -> AppException.notFound("KanbanColumn", req.getColumnId()));
        }

        task.setColumn(column);
        task.setOrderIndex(req.getOrderIndex());
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(UUID id, User currentUser) {
        Task task = findOrThrow(id);
        boolean isReporter = task.getReporter().getId().equals(currentUser.getId());
        boolean isSiteAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isProjectAdmin = memberRepository.existsByIdProjectIdAndIdUserIdAndRole(
                task.getProject().getId(), currentUser.getId(), MemberRole.ADMIN);
        boolean isOwner = memberRepository.existsByIdProjectIdAndIdUserIdAndRole(
                task.getProject().getId(), currentUser.getId(), MemberRole.OWNER);

        if (!isReporter && !isSiteAdmin && !isProjectAdmin && !isOwner) {
            throw AppException.forbidden();
        }
        taskRepository.delete(task);
    }

    @Transactional
    public KanbanColumnResponse createColumn(UUID projectId, User currentUser, CreateKanbanColumnRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> AppException.notFound("Project", projectId));
        checkAdminOrOwner(projectId, currentUser);

        KanbanColumn column = KanbanColumn.builder()
                .project(project)
                .name(req.getName())
                .color(req.getColor())
                .orderIndex(req.getOrderIndex())
                .wipLimit(req.getWipLimit())
                .build();

        KanbanColumn saved = columnRepository.save(column);
        return KanbanColumnResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .color(saved.getColor())
                .orderIndex(saved.getOrderIndex())
                .wipLimit(saved.getWipLimit())
                .tasks(List.of())
                .build();
    }

    @Transactional
    public void deleteColumn(Long columnId, User currentUser) {
        KanbanColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> AppException.notFound("KanbanColumn", columnId));
        checkAdminOrOwner(column.getProject().getId(), currentUser);
        columnRepository.delete(column);
    }

    // --- helpers ---

    private Task findOrThrow(UUID id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Task", id));
    }

    private void checkIsMember(UUID projectId, UUID userId) {
        if (!memberRepository.existsByIdProjectIdAndIdUserId(projectId, userId)) {
            throw AppException.forbidden();
        }
    }

    private void checkAdminOrOwner(UUID projectId, User user) {
        boolean isOwner = memberRepository.existsByIdProjectIdAndIdUserIdAndRole(
                projectId, user.getId(), MemberRole.OWNER);
        boolean isAdmin = memberRepository.existsByIdProjectIdAndIdUserIdAndRole(
                projectId, user.getId(), MemberRole.ADMIN);
        boolean isSiteAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isOwner && !isAdmin && !isSiteAdmin) {
            throw AppException.forbidden();
        }
    }

    private TaskResponse toResponse(Task t) {
        return TaskResponse.builder()
                .id(t.getId())
                .projectId(t.getProject().getId())
                .columnId(t.getColumn() != null ? t.getColumn().getId() : null)
                .reporterUsername(t.getReporter().getUsername())
                .assigneeUsername(t.getAssignee() != null ? t.getAssignee().getUsername() : null)
                .assigneeDisplayName(t.getAssignee() != null ? t.getAssignee().getDisplayName() : null)
                .assigneeAvatarUrl(t.getAssignee() != null ? t.getAssignee().getAvatarUrl() : null)
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus().name())
                .priority(t.getPriority().name())
                .orderIndex(t.getOrderIndex())
                .dueDate(t.getDueDate())
                .storyPoints(t.getStoryPoints())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
