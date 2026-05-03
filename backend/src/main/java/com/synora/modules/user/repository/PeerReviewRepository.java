package com.synora.modules.user.repository;

import com.synora.modules.user.entity.PeerReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PeerReviewRepository extends JpaRepository<PeerReview, UUID> {

    Page<PeerReview> findByRevieweeIdOrderByCreatedAtDesc(UUID revieweeId, Pageable pageable);

    Optional<PeerReview> findByRevieweeIdAndReviewerId(UUID revieweeId, UUID reviewerId);

    long countByRevieweeId(UUID revieweeId);

    @Query("SELECT AVG(p.score) FROM PeerReview p WHERE p.reviewee.id = :userId")
    Double averageScoreFor(@Param("userId") UUID userId);
}
