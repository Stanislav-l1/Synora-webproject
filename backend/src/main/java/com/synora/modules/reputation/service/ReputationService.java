package com.synora.modules.reputation.service;

import com.synora.modules.notification.entity.NotificationType;
import com.synora.modules.notification.service.NotificationService;
import com.synora.modules.reputation.dto.ReputationEventResponse;
import com.synora.modules.reputation.entity.ReputationEvent;
import com.synora.modules.reputation.entity.ReputationEventType;
import com.synora.modules.reputation.repository.ReputationEventRepository;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.exception.AppException;
import com.synora.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReputationService {

    private final ReputationEventRepository reputationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private static final Map<ReputationEventType, Short> DELTAS = Map.of(
            ReputationEventType.POST_PUBLISHED,   (short) 10,
            ReputationEventType.POST_LIKED,        (short) 2,
            ReputationEventType.COMMENT_LIKED,     (short) 1,
            ReputationEventType.PROJECT_CREATED,   (short) 15,
            ReputationEventType.TASK_COMPLETED,    (short) 5,
            ReputationEventType.RECEIVED_FOLLOW,   (short) 3,
            ReputationEventType.MILESTONE_BONUS,   (short) 50,
            ReputationEventType.PENALTY,           (short) -10
    );

    private static final int[] MILESTONES = {100, 500, 1000, 5000, 10000};

    @Transactional
    public void award(UUID userId, ReputationEventType type, UUID entityId, String entityType, String description) {
        // Prevent duplicate rewards for the same event
        if (entityId != null && reputationRepository.existsByUserIdAndTypeAndEntityId(userId, type, entityId)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> AppException.notFound("User", userId));

        short delta = DELTAS.getOrDefault(type, (short) 0);

        ReputationEvent event = ReputationEvent.builder()
                .user(user)
                .type(type)
                .delta(delta)
                .entityId(entityId)
                .entityType(entityType)
                .description(description)
                .build();
        reputationRepository.save(event);

        int oldScore = user.getReputationScore();
        int newScore = oldScore + delta;
        user.setReputationScore(newScore);
        userRepository.save(user);

        // Check milestones
        for (int milestone : MILESTONES) {
            if (oldScore < milestone && newScore >= milestone) {
                notificationService.send(
                        userId, null, NotificationType.REPUTATION_MILESTONE,
                        null, "REPUTATION",
                        "{\"milestone\":" + milestone + "}");
            }
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<ReputationEventResponse> getHistory(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size);
        return PageResponse.from(
                reputationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                        .map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public int getScore(UUID userId) {
        return reputationRepository.sumDeltaByUserId(userId);
    }

    private ReputationEventResponse toResponse(ReputationEvent e) {
        return ReputationEventResponse.builder()
                .id(e.getId())
                .type(e.getType().name())
                .delta(e.getDelta())
                .entityId(e.getEntityId())
                .entityType(e.getEntityType())
                .description(e.getDescription())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
