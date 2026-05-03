package com.synora.modules.verification.repository;

import com.synora.modules.verification.entity.UserVerification;
import com.synora.modules.verification.entity.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserVerificationRepository extends JpaRepository<UserVerification, UUID> {

    Optional<UserVerification> findFirstByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<UserVerification> findFirstByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, VerificationStatus status);

    Page<UserVerification> findByStatusOrderByCreatedAtAsc(VerificationStatus status, Pageable pageable);

    boolean existsByUserIdAndStatus(UUID userId, VerificationStatus status);
}
