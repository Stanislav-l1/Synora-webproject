package com.synora.modules.notification.service;

import com.synora.modules.notification.dto.NotificationResponse;
import com.synora.modules.notification.entity.Notification;
import com.synora.modules.notification.entity.NotificationType;
import com.synora.modules.notification.repository.NotificationRepository;
import com.synora.modules.push.service.PushNotificationService;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
    private final PushNotificationService pushNotificationService;

    @Value("${app.public-base-url:http://localhost:3000}")
    private String publicBaseUrl;

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

        // Push via Web Push (async, best-effort)
        String pushTitle = buildPushTitle(type, actor);
        String pushBody  = payload != null ? payload : type.name();
        String pushUrl   = publicBaseUrl + "/feed";
        pushNotificationService.sendToUser(recipientId, pushTitle, pushBody, pushUrl);
    }

    private String buildPushTitle(NotificationType type, User actor) {
        String name = actor != null ? (actor.getDisplayName() != null ? actor.getDisplayName() : actor.getUsername()) : "Someone";
        return switch (type) {
            case POST_LIKE         -> name + " liked your post";
            case POST_COMMENT      -> name + " commented on your post";
            case COMMENT_REPLY     -> name + " replied to your comment";
            case COMMENT_LIKE      -> name + " liked your comment";
            case FOLLOW            -> name + " started following you";
            case PROJECT_INVITE    -> name + " invited you to a project";
            case PROJECT_JOIN      -> name + " joined your project";
            case TASK_ASSIGNED     -> "New task assigned to you";
            case TASK_COMPLETED    -> "A task was completed";
            case MESSAGE_RECEIVED  -> name + " sent you a message";
            case REPUTATION_MILESTONE -> "You reached a reputation milestone!";
            case JOB_APPLICATION   -> name + " applied to your job posting";
            default                -> "You have a new notification";
        };
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
