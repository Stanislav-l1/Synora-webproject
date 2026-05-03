package com.synora.modules.subscription.service;

import com.synora.modules.subscription.dto.SubscriptionResponse;
import com.synora.modules.subscription.entity.SubscriptionStatus;
import com.synora.modules.subscription.entity.SubscriptionTier;
import com.synora.modules.subscription.entity.UserSubscription;
import com.synora.modules.subscription.repository.UserSubscriptionRepository;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final UserSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public SubscriptionResponse getCurrent(UUID userId) {
        return subscriptionRepository.findLatestByUserId(userId)
                .map(this::toResponse)
                .orElseGet(() -> SubscriptionResponse.builder()
                        .tier(SubscriptionTier.FREE.name())
                        .status(SubscriptionStatus.ACTIVE.name())
                        .build());
    }

    @Transactional
    public SubscriptionResponse upgrade(User currentUser, SubscriptionTier tier) {
        if (tier == SubscriptionTier.FREE) {
            throw AppException.badRequest("Use cancel to downgrade to Free");
        }
        if (currentUser.getSubscriptionTier() == tier) {
            throw AppException.conflict("Already on " + tier.name() + " plan");
        }

        // Cancel current active subscription if any
        subscriptionRepository.findLatestByUserIdAndStatus(currentUser.getId(), SubscriptionStatus.ACTIVE)
                .ifPresent(sub -> {
                    sub.setStatus(SubscriptionStatus.CANCELLED);
                    sub.setCancelledAt(Instant.now());
                    subscriptionRepository.save(sub);
                });

        // Create new subscription (mock — no real payment)
        Instant now = Instant.now();
        UserSubscription sub = UserSubscription.builder()
                .user(currentUser)
                .tier(tier)
                .status(SubscriptionStatus.ACTIVE)
                .startedAt(now)
                .expiresAt(now.plus(30, ChronoUnit.DAYS))
                .build();
        sub = subscriptionRepository.save(sub);

        // Update user's tier
        currentUser.setSubscriptionTier(tier);
        userRepository.save(currentUser);

        return toResponse(sub);
    }

    @Transactional
    public SubscriptionResponse cancel(User currentUser) {
        UserSubscription sub = subscriptionRepository
                .findLatestByUserIdAndStatus(currentUser.getId(), SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> AppException.notFound("Subscription", currentUser.getId()));

        sub.setStatus(SubscriptionStatus.CANCELLED);
        sub.setCancelledAt(Instant.now());
        subscriptionRepository.save(sub);

        currentUser.setSubscriptionTier(SubscriptionTier.FREE);
        userRepository.save(currentUser);

        return toResponse(sub);
    }

    private SubscriptionResponse toResponse(UserSubscription s) {
        return SubscriptionResponse.builder()
                .id(s.getId())
                .tier(s.getTier().name())
                .status(s.getStatus().name())
                .startedAt(s.getStartedAt())
                .expiresAt(s.getExpiresAt())
                .cancelledAt(s.getCancelledAt())
                .build();
    }
}
