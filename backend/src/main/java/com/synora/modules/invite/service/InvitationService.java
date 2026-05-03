package com.synora.modules.invite.service;

import com.synora.modules.invite.dto.BulkInviteRequest;
import com.synora.modules.invite.dto.InvitationResponse;
import com.synora.modules.invite.dto.SendInvitationRequest;
import com.synora.modules.invite.entity.Invitation;
import com.synora.modules.invite.entity.InvitationStatus;
import com.synora.modules.invite.repository.InvitationRepository;
import com.synora.modules.invite.repository.UserContactRepository;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
    private static final long TTL_DAYS = 14;

    private final InvitationRepository invitationRepository;
    private final UserContactRepository userContactRepository;
    private final UserRepository userRepository;

    @Value("${app.public-base-url:http://localhost:3000}")
    private String publicBaseUrl;

    @Transactional
    public InvitationResponse send(User inviter, SendInvitationRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        ensureNotExistingUser(email);

        Invitation inv = createInvitation(inviter, email, req.getMessage());
        return toResponse(inv);
    }

    @Transactional
    public List<InvitationResponse> sendBulk(User inviter, BulkInviteRequest req) {
        List<InvitationResponse> out = new ArrayList<>();
        for (String raw : req.getEmails()) {
            if (raw == null || raw.isBlank()) continue;
            String email = raw.trim().toLowerCase();
            if (userRepository.findByEmail(email).isPresent()) continue;
            out.add(toResponse(createInvitation(inviter, email, req.getMessage())));
        }
        if (out.isEmpty()) {
            throw AppException.badRequest("No valid invitees");
        }
        return out;
    }

    @Transactional(readOnly = true)
    public PageResponse<InvitationResponse> listMine(UUID inviterId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                invitationRepository.findByInviterId(inviterId, pageable).map(this::toResponse));
    }

    @Transactional
    public void revoke(User inviter, UUID invitationId) {
        Invitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> AppException.notFound("Invitation", invitationId));
        if (!inv.getInviter().getId().equals(inviter.getId())) throw AppException.forbidden();
        if (inv.getStatus() != InvitationStatus.PENDING) {
            throw AppException.conflict("Cannot revoke a non-pending invitation");
        }
        inv.setStatus(InvitationStatus.REVOKED);
    }

    @Transactional
    public InvitationResponse accept(String token, User newUser) {
        Invitation inv = invitationRepository.findByToken(token)
                .orElseThrow(() -> AppException.notFound("Invitation", token));

        if (inv.getStatus() != InvitationStatus.PENDING) {
            throw AppException.conflict("Invitation is not pending");
        }
        if (inv.getExpiresAt().isBefore(Instant.now())) {
            inv.setStatus(InvitationStatus.EXPIRED);
            throw AppException.conflict("Invitation expired");
        }

        inv.setStatus(InvitationStatus.ACCEPTED);
        inv.setAcceptedAt(Instant.now());
        inv.setAcceptedBy(newUser);

        userContactRepository.findByUserIdAndEmailIgnoreCase(
                inv.getInviter().getId(), inv.getEmail())
                .ifPresent(c -> c.setMatchedUser(newUser));

        return toResponse(inv);
    }

    @Transactional(readOnly = true)
    public InvitationResponse preview(String token) {
        Invitation inv = invitationRepository.findByToken(token)
                .orElseThrow(() -> AppException.notFound("Invitation", token));
        return toResponse(inv);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> myStats(UUID inviterId) {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("pending",  invitationRepository.countByInviterIdAndStatus(inviterId, InvitationStatus.PENDING));
        stats.put("accepted", invitationRepository.countByInviterIdAndStatus(inviterId, InvitationStatus.ACCEPTED));
        stats.put("revoked",  invitationRepository.countByInviterIdAndStatus(inviterId, InvitationStatus.REVOKED));
        return stats;
    }

    // --- internals ---

    private Invitation createInvitation(User inviter, String email, String message) {
        Invitation inv = Invitation.builder()
                .inviter(inviter)
                .email(email)
                .message(message)
                .token(generateToken())
                .status(InvitationStatus.PENDING)
                .expiresAt(Instant.now().plus(TTL_DAYS, ChronoUnit.DAYS))
                .build();
        return invitationRepository.save(inv);
    }

    private void ensureNotExistingUser(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw AppException.conflict("User with this email already exists");
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return B64.encodeToString(bytes);
    }

    private InvitationResponse toResponse(Invitation inv) {
        return InvitationResponse.builder()
                .id(inv.getId())
                .email(inv.getEmail())
                .token(inv.getToken())
                .status(inv.getStatus().name())
                .message(inv.getMessage())
                .shareUrl(publicBaseUrl + "/register?invite=" + inv.getToken())
                .expiresAt(inv.getExpiresAt())
                .acceptedAt(inv.getAcceptedAt())
                .createdAt(inv.getCreatedAt())
                .build();
    }
}
