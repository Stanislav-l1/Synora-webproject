package com.synora.modules.reputation.repository;

import com.synora.modules.reputation.entity.ReputationEvent;
import com.synora.modules.reputation.entity.ReputationEventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReputationEventRepository extends JpaRepository<ReputationEvent, Long> {

    Page<ReputationEvent> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(r.delta), 0) FROM ReputationEvent r WHERE r.user.id = :userId")
    int sumDeltaByUserId(UUID userId);

    boolean existsByUserIdAndTypeAndEntityId(UUID userId, ReputationEventType type, UUID entityId);
}
