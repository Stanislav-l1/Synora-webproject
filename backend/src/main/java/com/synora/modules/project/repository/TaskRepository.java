package com.synora.modules.project.repository;

import com.synora.modules.project.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByProjectIdAndColumnIdOrderByOrderIndex(UUID projectId, Long columnId);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.column IS NULL ORDER BY t.orderIndex")
    List<Task> findUnassignedByProjectId(@Param("projectId") UUID projectId);

    Page<Task> findByAssigneeId(UUID assigneeId, Pageable pageable);

    Page<Task> findByProjectId(UUID projectId, Pageable pageable);
}
