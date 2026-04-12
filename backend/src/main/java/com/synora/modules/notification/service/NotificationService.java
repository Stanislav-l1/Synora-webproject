package com.synora.modules.notification.service;

import com.synora.modules.notification.dto.NotificationResponse;
import com.synora.modules.notification.entity.Notification;
import com.synora.modules.notification.entity.NotificationType;
import com.synora.modules.notification.repository.NotificationRepository;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getNotifications(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size);
        return PageResponse.from(
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                        .map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public long countUnread(UUID userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        notificationRepository.markAsRead(notificationId, userId);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }

    /**
     * Creates a notification and pushes it via WebSocket to /user/{userId}/queue/notifications.
     */
    @Transactional
    public void send(UUID recipientId, User actor, NotificationType type,
                     UUID entityId, String entityType, String payload) {
        // Don't notify yourself
        if (actor != null && actor.getId().equals(recipientId)) return;

        User recipient = userRepository.findById(recipientId).orElse(null);
        if (recipient == null) return;

        Notification notification = Notification.builder()
                .user(recipient)
                .actor(actor)
                .type(type)
                .entityId(entityId)
                .entityType(entityType)
                .payload(payload)
                .build();

        notification = notificationRepository.save(notification);

        // Push via WebSocket
        messagingTemplate.convertAndSendToUser(
                recipientId.toString(),
                "/queue/notifications",
                toResponse(notification));
    }

    private NotificationResponse toResponse(Notification n) {
        var builder = NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType().name())
                .entityId(n.getEntityId())
                .entityType(n.getEntityType())
                .payload(n.getPayload())
                .read(n.isRead())
                .createdAt(n.getCreatedAt());

        if (n.getActor() != null) {
            builder.actorId(n.getActor().getId())
                    .actorUsername(n.getActor().getUsername())
                    .actorDisplayName(n.getActor().getDisplayName())
                    .actorAvatarUrl(n.getActor().getAvatarUrl());
        }

        return builder.build();
    }
}
