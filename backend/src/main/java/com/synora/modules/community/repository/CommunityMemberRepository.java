package com.synora.modules.community.repository;

import com.synora.modules.community.entity.CommunityMember;
import com.synora.modules.community.entity.CommunityMemberId;
import com.synora.modules.community.entity.CommunityRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CommunityMemberRepository extends JpaRepository<CommunityMember, CommunityMemberId> {

    boolean existsByIdCommunityIdAndIdUserId(UUID communityId, UUID userId);

    Optional<CommunityMember> findByIdCommunityIdAndIdUserId(UUID communityId, UUID userId);

    Page<CommunityMember> findByIdCommunityId(UUID communityId, Pageable pageable);

    Optional<CommunityRole> findRoleByIdCommunityIdAndIdUserId(UUID communityId, UUID userId);
}
