package com.synora.modules.user.service;

import com.synora.modules.user.dto.CreatePeerReviewRequest;
import com.synora.modules.user.dto.PeerReviewDto;
import com.synora.modules.user.entity.PeerReview;
import com.synora.modules.user.entity.PeerReviewContext;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.PeerReviewRepository;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PeerReviewService {

    private final PeerReviewRepository peerReviewRepository;
    private final UserRepository userRepository;

    @Transactional
    public PeerReviewDto submit(User reviewer, UUID revieweeId, CreatePeerReviewRequest req) {
        if (reviewer.getId().equals(revieweeId)) {
            throw AppException.badRequest("Can't review yourself");
        }
        User reviewee = userRepository.findById(revieweeId)
                .orElseThrow(() -> AppException.notFound("User", revieweeId));

        PeerReviewContext ctx;
        try {
            ctx = req.getContext() != null && !req.getContext().isBlank()
                    ? PeerReviewContext.valueOf(req.getContext().toUpperCase())
                    : PeerReviewContext.GENERAL;
        } catch (IllegalArgumentException e) {
            throw AppException.badRequest("Unknown context: " + req.getContext());
        }

        PeerReview review = peerReviewRepository
                .findByRevieweeIdAndReviewerId(revieweeId, reviewer.getId())
                .orElseGet(() -> PeerReview.builder()
                        .reviewee(reviewee)
                        .reviewer(reviewer)
                        .build());
        review.setScore(req.getScore());
        review.setContext(ctx);
        review.setComment(req.getComment());

        return toDto(peerReviewRepository.save(review));
    }

    @Transactional
    public void delete(User reviewer, UUID reviewId) {
        PeerReview review = peerReviewRepository.findById(reviewId)
                .orElseThrow(() -> AppException.notFound("Review", reviewId));
        if (!review.getReviewer().getId().equals(reviewer.getId())) {
            throw AppException.forbidden();
        }
        peerReviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public PageResponse<PeerReviewDto> listFor(UUID revieweeId, int page, int size) {
        var pageable = PageRequest.of(page, Math.min(size, 50));
        return PageResponse.from(
                peerReviewRepository.findByRevieweeIdOrderByCreatedAtDesc(revieweeId, pageable)
                        .map(this::toDto));
    }

    private PeerReviewDto toDto(PeerReview r) {
        User u = r.getReviewer();
        return PeerReviewDto.builder()
                .id(r.getId())
                .reviewerId(u != null ? u.getId() : null)
                .reviewerUsername(u != null ? u.getUsername() : null)
                .reviewerDisplayName(u != null ? u.getDisplayName() : null)
                .reviewerAvatarUrl(u != null ? u.getAvatarUrl() : null)
                .score(r.getScore())
                .context(r.getContext().name())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
