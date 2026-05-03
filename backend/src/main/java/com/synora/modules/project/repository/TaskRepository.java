package com.synora.modules.project.repository;

import com.synora.modules.project.entity.Task;
import com.synora.modules.project.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByProjectIdAndColumnIdOrderByOrderIndex(UUID projectId, Long columnId);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.column IS NULL ORDER BY t.orderIndex")
    List<Task> findUnassignedByProjectId(@Param("projectId") UUID projectId);

    Page<Task> findByAssigneeId(UUID assigneeId, Pageable pageable);

    Page<Task> findByProjectId(UUID projectId, Pageable pageable);

    long countByAssigneeIdAndStatusIn(UUID assigneeId, Collection<TaskStatus> statuses);

    @Query("""
            SELECT t FROM Task t
            WHERE t.assignee.id = :userId
              AND t.status NOT IN :doneStatuses
              AND t.dueDate IS NOT NULL
              AND t.dueDate <= :horizon
            ORDER BY t.dueDate ASC
            """)
    List<Task> findUpcomingByAssignee(
            @Param("userId") UUID userId,
            @Param("doneStatuses") Collection<TaskStatus> doneStatuses,
            @Param("horizon") LocalDate horizon,
            Pageable pageable);
}
