package com.synora.modules.user.repository;

import com.synora.modules.user.entity.User;
import com.synora.modules.user.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByGithubId(String githubId);

    Optional<User> findByGoogleId(String googleId);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username = :login OR u.email = :login")
    Optional<User> findByUsernameOrEmail(String login);

    // Admin queries
    @Query("""
            SELECT u FROM User u
            WHERE (:q IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%'))
                               OR LOWER(u.email)    LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:role IS NULL OR u.role = :role)
              AND (:banned IS NULL OR u.banned = :banned)
            ORDER BY u.createdAt DESC
            """)
    Page<User> adminSearch(
            @Param("q") String q,
            @Param("role") UserRole role,
            @Param("banned") Boolean banned,
            Pageable pageable);

    long countByCreatedAtAfter(Instant since);

    long countByBannedTrue();
}
