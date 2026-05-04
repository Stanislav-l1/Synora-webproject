package com.synora.modules.analytics.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class ProjectAnalyticsItem {
    private UUID    id;
    private String  name;
    private long    members;
    private long    stars;
    private Instant createdAt;
}
