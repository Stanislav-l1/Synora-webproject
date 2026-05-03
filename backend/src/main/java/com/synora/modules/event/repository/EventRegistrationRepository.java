package com.synora.modules.event.repository;

import com.synora.modules.event.entity.EventRegistration;
import com.synora.modules.event.entity.EventRegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, UUID> {

    Optional<EventRegistration> findByEventIdAndUserId(UUID eventId, UUID userId);

    boolean existsByEventIdAndUserIdAndStatusNot(UUID eventId, UUID userId, EventRegistrationStatus status);

    Page<EventRegistration> findByUserIdOrderByRegisteredAtDesc(UUID userId, Pageable pageable);

    long countByEventIdAndStatus(UUID eventId, EventRegistrationStatus status);
}
