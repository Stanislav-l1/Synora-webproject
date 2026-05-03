package com.synora.modules.user.service;

import com.synora.modules.message.repository.MessageRepository;
import com.synora.modules.post.repository.PostRepository;
import com.synora.modules.project.entity.MemberRole;
import com.synora.modules.project.entity.Project;
import com.synora.modules.project.entity.Task;
import com.synora.modules.project.entity.TaskStatus;
import com.synora.modules.project.repository.ProjectMemberRepository;
import com.synora.modules.project.repository.ProjectRepository;
import com.synora.modules.project.repository.TaskRepository;
import com.synora.modules.reputation.repository.ReputationEventRepository;
import com.synora.modules.user.dto.ActivitySummaryResponse;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivitySummaryService {

    private static final Set<TaskStatus> OPEN_STATUSES =
            EnumSet.of(TaskStatus.BACKLOG, TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW);
    private static final Set<TaskStatus> DONE_STATUSES = EnumSet.of(TaskStatus.DONE);

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final MessageRepository messageRepository;
    private final ReputationEventRepository reputationEventRepository;

    @Transactional(readOnly = true)
    public ActivitySummaryResponse getSummary(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw AppException.notFound("User", userId);
        }

        Instant weekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        LocalDate today = LocalDate.now();
        LocalDate horizon = today.plusDays(7);

        long postsThisWeek = postRepository.countByAuthorIdAndCreatedAtAfter(userId, weekAgo);
        int repDelta = reputationEventRepository.sumDeltaByUserIdSince(userId, weekAgo);
        long openTasks = taskRepository.countByAssigneeIdAndStatusIn(userId, OPEN_STATUSES);

        List<Task> upcoming = taskRepository.findUpcomingByAssignee(
                userId, DONE_STATUSES, horizon, PageRequest.of(0, 5));

        long currentProjectsCount = projectRepository.countCurrentForUser(userId);
        List<Project> currentProjects = projectRepository
                .findCurrentForUser(userId, PageRequest.of(0, 4))
                .getContent();

        long unread = messageRepository.countTotalUnreadForUser(userId, Instant.EPOCH);

        return ActivitySummaryResponse.builder()
                .postsThisWeek(postsThisWeek)
                .reputationDeltaThisWeek(repDelta)
                .openTasks(openTasks)
                .upcomingDeadlines(upcoming.size())
                .currentProjects(currentProjectsCount)
                .unreadMessages(unread)
                .upcomingTasks(upcoming.stream().map(this::toUpcomingTask).toList())
                .currentProjectsList(currentProjects.stream()
                        .map(p -> toCurrentProject(p, userId)).toList())
                .build();
    }

    private ActivitySummaryResponse.UpcomingTask toUpcomingTask(Task t) {
        return ActivitySummaryResponse.UpcomingTask.builder()
                .id(t.getId())
                .title(t.getTitle())
                .dueDate(t.getDueDate())
                .status(t.getStatus().name())
                .priority(t.getPriority().name())
                .projectId(t.getProject() != null ? t.getProject().getId() : null)
                .projectName(t.getProject() != null ? t.getProject().getName() : null)
                .build();
    }

    private ActivitySummaryResponse.CurrentProject toCurrentProject(Project p, UUID userId) {
        String role;
        if (p.getOwner() != null && userId.equals(p.getOwner().getId())) {
            role = "OWNER";
        } else {
            role = projectMemberRepository.findByIdProjectIdAndIdUserId(p.getId(), userId)
                    .map(pm -> pm.getRole() != null ? pm.getRole().name() : MemberRole.VIEWER.name())
                    .orElse(MemberRole.VIEWER.name());
        }
        return ActivitySummaryResponse.CurrentProject.builder()
                .id(p.getId())
                .name(p.getName())
                .role(role)
                .membersCount(p.getMembersCount())
                .starsCount(p.getStarsCount())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
