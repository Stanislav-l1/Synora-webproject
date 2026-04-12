package com.synora.modules.notification.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {

    private UUID id;
    private String type;
    private UUID actorId;
    private String actorUsername;
    private String actorDisplayName;
    private String actorAvatarUrl;
    private UUID entityId;
    private String entityType;
    private String payload;
    private boolean read;
    private Instant createdAt;
}
