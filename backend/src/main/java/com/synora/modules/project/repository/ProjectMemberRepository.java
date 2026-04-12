package com.synora.modules.project.repository;

import com.synora.modules.project.entity.MemberRole;
import com.synora.modules.project.entity.ProjectMember;
import com.synora.modules.project.entity.ProjectMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {

    List<ProjectMember> findByIdProjectId(UUID projectId);

    Optional<ProjectMember> findByIdProjectIdAndIdUserId(UUID projectId, UUID userId);

    boolean existsByIdProjectIdAndIdUserId(UUID projectId, UUID userId);

    boolean existsByIdProjectIdAndIdUserIdAndRole(UUID projectId, UUID userId, MemberRole role);
}
