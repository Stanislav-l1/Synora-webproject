package com.synora.modules.invite.repository;

import com.synora.modules.invite.entity.UserContact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserContactRepository extends JpaRepository<UserContact, Long> {

    Page<UserContact> findByUserId(UUID userId, Pageable pageable);

    Optional<UserContact> findByUserIdAndEmailIgnoreCase(UUID userId, String email);

    long countByUserId(UUID userId);

    @Query("""
           SELECT c FROM UserContact c
           WHERE c.user.id = :userId AND c.matchedUser IS NOT NULL
           """)
    List<UserContact> findMatched(@Param("userId") UUID userId);
}
