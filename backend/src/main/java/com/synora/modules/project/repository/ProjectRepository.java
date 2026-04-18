package com.synora.modules.project.repository;

import com.synora.modules.project.entity.Project;
import com.synora.modules.project.entity.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    Page<Project> findByIsPublicTrue(Pageable pageable);

    Page<Project> findByIsPublicTrueAndStatus(ProjectStatus status, Pageable pageable);

    @Query("""
            SELECT p FROM Project p JOIN p.tags t
            WHERE p.isPublic = true AND t.id = :tagId
            """)
    Page<Project> findPublicByTagId(@Param("tagId") Long tagId, Pageable pageable);

    Page<Project> findByOwnerUsername(String username, Pageable pageable);

    @Modifying
    @Query("UPDATE Project p SET p.membersCount = p.membersCount + :delta WHERE p.id = :id")
    void adjustMembers(@Param("id") UUID id, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Project p SET p.starsCount = p.starsCount + :delta WHERE p.id = :id")
    void adjustStars(@Param("id") UUID id, @Param("delta") int delta);

    long countByOwnerId(UUID ownerId);
}
