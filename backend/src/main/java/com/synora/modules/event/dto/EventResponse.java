package com.synora.modules.event.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventResponse {

    private UUID id;
    private String slug;
    private String type;
    private String status;
    private String title;
    private String description;
    private String coverUrl;
    private Instant startsAt;
    private Instant endsAt;
    private String timezone;
    private String location;
    private String venueName;
    private String onlineUrl;
    private boolean online;
    private Integer capacity;
    private long registeredCount;
    private List<String> tags;

    private UUID organizerId;
    private String organizerUsername;
    private String organizerDisplayName;
    private String organizerAvatarUrl;

    private UUID communityId;
    private String communityName;
    private String communitySlug;

    private String myRegistrationStatus;

    private Instant createdAt;
    private Instant updatedAt;
}
