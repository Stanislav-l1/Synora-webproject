package com.synora.modules.invite.repository;

import com.synora.modules.invite.entity.Invitation;
import com.synora.modules.invite.entity.InvitationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, UUID> {

    Optional<Invitation> findByToken(String token);

    Page<Invitation> findByInviterId(UUID inviterId, Pageable pageable);

    long countByInviterIdAndStatus(UUID inviterId, InvitationStatus status);

    List<Invitation> findByEmailIgnoreCaseAndStatus(String email, InvitationStatus status);
}
