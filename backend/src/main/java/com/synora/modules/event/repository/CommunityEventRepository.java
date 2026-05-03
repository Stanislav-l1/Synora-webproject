package com.synora.modules.event.repository;

import com.synora.modules.event.entity.CommunityEvent;
import com.synora.modules.event.entity.CommunityEventStatus;
import com.synora.modules.event.entity.CommunityEventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface CommunityEventRepository extends JpaRepository<CommunityEvent, UUID> {

    Optional<CommunityEvent> findBySlug(String slug);

    Page<CommunityEvent> findByStatusOrderByStartsAtAsc(CommunityEventStatus status, Pageable pageable);

    @Query("""
        SELECT e FROM CommunityEvent e
        WHERE e.status = 'PUBLISHED'
          AND (:type IS NULL OR e.type = :type)
          AND (:from IS NULL OR e.startsAt >= :from)
          AND (:to   IS NULL OR e.startsAt <= :to)
        ORDER BY e.startsAt ASC
        """)
    Page<CommunityEvent> search(
            @Param("type")  CommunityEventType type,
            @Param("from")  Instant from,
            @Param("to")    Instant to,
            Pageable pageable);

    Page<CommunityEvent> findByOrganizerIdOrderByStartsAtDesc(UUID organizerId, Pageable pageable);

    @Query("SELECT COUNT(r) FROM EventRegistration r WHERE r.event.id = :eventId AND r.status = 'REGISTERED'")
    long countRegistered(@Param("eventId") UUID eventId);
}
