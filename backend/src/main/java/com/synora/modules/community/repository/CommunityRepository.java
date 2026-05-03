package com.synora.modules.community.repository;

import com.synora.modules.community.entity.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CommunityRepository extends JpaRepository<Community, UUID> {

    Optional<Community> findBySlug(String slug);

    boolean existsBySlug(String slug);
    boolean existsByName(String name);

    Page<Community> findByPrivacyNot(
            com.synora.modules.community.entity.CommunityPrivacy privacy, Pageable pageable);

    @Query("SELECT c FROM Community c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "AND c.privacy <> 'PRIVATE'")
    Page<Community> searchPublic(@Param("q") String q, Pageable pageable);

    @Query("SELECT c FROM Community c JOIN CommunityMember m ON m.community = c " +
           "WHERE m.user.id = :userId")
    Page<Community> findByMember(@Param("userId") UUID userId, Pageable pageable);

    @Modifying
    @Query("UPDATE Community c SET c.membersCount = c.membersCount + 1 WHERE c.id = :id")
    void incrementMembers(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Community c SET c.membersCount = c.membersCount - 1 WHERE c.id = :id")
    void decrementMembers(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Community c SET c.postsCount = c.postsCount + 1 WHERE c.id = :id")
    void incrementPosts(@Param("id") UUID id);
}
