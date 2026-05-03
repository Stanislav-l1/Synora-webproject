package com.synora.modules.verification.service;

import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserRepository;
import com.synora.modules.verification.dto.ReviewVerificationRequest;
import com.synora.modules.verification.dto.SubmitVerificationRequest;
import com.synora.modules.verification.dto.VerificationResponse;
import com.synora.modules.verification.entity.UserVerification;
import com.synora.modules.verification.entity.VerificationStatus;
import com.synora.modules.verification.entity.VerificationType;
import com.synora.modules.verification.repository.UserVerificationRepository;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final UserVerificationRepository verificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public VerificationResponse getCurrent(UUID userId) {
        return verificationRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional
    public VerificationResponse submit(User user, SubmitVerificationRequest req) {
        VerificationType type;
        try {
            type = VerificationType.valueOf(req.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw AppException.badRequest("Invalid verification type: " + req.getType());
        }

        if (verificationRepository.existsByUserIdAndStatus(user.getId(), VerificationStatus.PENDING)) {
            throw AppException.conflict("You already have a pending verification request");
        }

        UserVerification v = UserVerification.builder()
                .user(user)
                .type(type)
                .notes(req.getNotes())
                .build();
        return toResponse(verificationRepository.save(v));
    }

    @Transactional
    public VerificationResponse cancel(User user) {
        UserVerification v = verificationRepository
                .findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), VerificationStatus.PENDING)
                .orElseThrow(() -> AppException.notFound("Pending verification", user.getId()));
        v.setStatus(VerificationStatus.REJECTED);
        v.setAdminNotes("Cancelled by user");
        v.setReviewedAt(Instant.now());
        return toResponse(verificationRepository.save(v));
    }

    @Transactional(readOnly = true)
    public PageResponse<VerificationResponse> getPending(int page, int size) {
        var pageable = PageRequest.of(page, size);
        return PageResponse.from(
                verificationRepository.findByStatusOrderByCreatedAtAsc(VerificationStatus.PENDING, pageable)
                        .map(this::toResponse));
    }

    @Transactional
    public VerificationResponse review(UUID verificationId, User admin, ReviewVerificationRequest req) {
        UserVerification v = verificationRepository.findById(verificationId)
                .orElseThrow(() -> AppException.notFound("Verification", verificationId));

        if (v.getStatus() != VerificationStatus.PENDING) {
            throw AppException.conflict("Verification already reviewed");
        }

        VerificationStatus newStatus;
        try {
            newStatus = VerificationStatus.valueOf(req.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw AppException.badRequest("Invalid status: " + req.getStatus());
        }
        if (newStatus == VerificationStatus.PENDING) {
            throw AppException.badRequest("Cannot set status back to PENDING");
        }

        v.setStatus(newStatus);
        v.setAdminNotes(req.getAdminNotes());
        v.setReviewedBy(admin.getId());
        v.setReviewedAt(Instant.now());
        verificationRepository.save(v);

        User target = v.getUser();
        if (newStatus == VerificationStatus.APPROVED) {
            target.setVerified(true);
            target.setVerificationType(v.getType());
        } else {
            boolean hasApproved = verificationRepository
                    .findFirstByUserIdAndStatusOrderByCreatedAtDesc(target.getId(), VerificationStatus.APPROVED)
                    .isPresent();
            if (!hasApproved) {
                target.setVerified(false);
                target.setVerificationType(null);
            }
        }
        userRepository.save(target);

        return toResponse(v);
    }

    private VerificationResponse toResponse(UserVerification v) {
        User u = v.getUser();
        return VerificationResponse.builder()
                .id(v.getId())
                .type(v.getType().name())
                .status(v.getStatus().name())
                .notes(v.getNotes())
                .adminNotes(v.getAdminNotes())
                .reviewedAt(v.getReviewedAt())
                .createdAt(v.getCreatedAt())
                .username(u != null ? u.getUsername() : null)
                .displayName(u != null ? u.getDisplayName() : null)
                .avatarUrl(u != null ? u.getAvatarUrl() : null)
                .build();
    }
}
