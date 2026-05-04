package com.synora.modules.security.repository;

import com.synora.modules.security.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {

    Optional<UserSession> findByRefreshTokenHash(String hash);

    List<UserSession> findByUserIdAndRevokedFalseAndExpiresAtAfter(UUID userId, Instant now);

    @Modifying
    @Query("UPDATE UserSession s SET s.revoked = true WHERE s.user.id = :userId AND s.id <> :exceptId")
    void revokeAllExcept(@Param("userId") UUID userId, @Param("exceptId") UUID exceptId);

    @Modifying
    @Query("UPDATE UserSession s SET s.revoked = true WHERE s.user.id = :userId")
    void revokeAll(@Param("userId") UUID userId);
}
