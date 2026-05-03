package com.synora.modules.git.repository;

import com.synora.modules.git.entity.GitProvider;
import com.synora.modules.git.entity.GitRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GitRepoRepository extends JpaRepository<GitRepo, UUID> {

    List<GitRepo> findByUserId(UUID userId);

    Page<GitRepo> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT r FROM GitRepo r WHERE r.user.id = :userId AND r.featured = true ORDER BY r.starsCount DESC")
    List<GitRepo> findFeaturedByUserId(@Param("userId") UUID userId);

    Optional<GitRepo> findByUserIdAndProviderAndExternalId(UUID userId, GitProvider provider, String externalId);

    boolean existsByUserIdAndProviderAndExternalId(UUID userId, GitProvider provider, String externalId);

    @Query("SELECT r FROM GitRepo r WHERE r.user.id = :userId ORDER BY r.starsCount DESC")
    List<GitRepo> findByUserIdOrderByStarsDesc(@Param("userId") UUID userId);
}
