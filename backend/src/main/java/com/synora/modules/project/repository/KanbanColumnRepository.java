package com.synora.modules.project.repository;

import com.synora.modules.project.entity.KanbanColumn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface KanbanColumnRepository extends JpaRepository<KanbanColumn, Long> {

    List<KanbanColumn> findByProjectIdOrderByOrderIndex(UUID projectId);
}
