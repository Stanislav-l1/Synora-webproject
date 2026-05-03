package com.synora.modules.push.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synora.modules.push.entity.PushSubscription;
import com.synora.modules.push.repository.PushSubscriptionRepository;
import com.synora.modules.user.entity.User;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushNotificationService {

    private final PushSubscriptionRepository repository;
    private final ObjectMapper objectMapper;

    @Value("${push.vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${push.vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${push.vapid.subject:mailto:admin@synora.io}")
    private String vapidSubject;

    private PushService pushService;
    private boolean enabled = false;

    @PostConstruct
    void init() {
        if (vapidPublicKey.isBlank() || vapidPrivateKey.isBlank()) {
            log.warn("Web Push disabled: VAPID keys not configured (set VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)");
            return;
        }
        try {
            pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
            enabled = true;
            log.info("Web Push enabled");
        } catch (Exception e) {
            log.error("Failed to initialise PushService — Web Push disabled", e);
        }
    }

    @Transactional
    public void subscribe(UUID userId, User user, String endpoint, String p256dh, String auth) {
        repository.findByEndpoint(endpoint).ifPresentOrElse(
            existing -> { /* already registered */ },
            () -> repository.save(PushSubscription.builder()
                    .user(user)
                    .endpoint(endpoint)
                    .p256dh(p256dh)
                    .auth(auth)
                    .build())
        );
    }

    @Transactional
    public void unsubscribe(UUID userId, String endpoint) {
        repository.deleteByUserIdAndEndpoint(userId, endpoint);
    }

    @Async
    public void sendToUser(UUID userId, String title, String body, String url) {
        if (!enabled) return;

        List<PushSubscription> subs = repository.findByUserId(userId);
        if (subs.isEmpty()) return;

        String payload;
        try {
            payload = objectMapper.writeValueAsString(Map.of(
                "title", title,
                "body",  body,
                "url",   url
            ));
        } catch (Exception e) {
            return;
        }

        for (PushSubscription sub : subs) {
            try {
                Notification notification = new Notification(
                        sub.getEndpoint(),
                        sub.getP256dh(),
                        sub.getAuth(),
                        payload.getBytes()
                );
                var response = pushService.send(notification);
                int status = response.getStatusLine().getStatusCode();
                if (status == 410 || status == 404) {
                    // Subscription expired — clean up
                    repository.delete(sub);
                }
            } catch (Exception e) {
                log.debug("Push delivery failed for subscription {}: {}", sub.getId(), e.getMessage());
            }
        }
    }

    public String getVapidPublicKey() {
        return vapidPublicKey;
    }
}
