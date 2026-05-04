package com.synora.modules.analytics.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class PostAnalyticsItem {
    private UUID    id;
    private String  title;
    private long    views;
    private long    likes;
    private long    comments;
    private long    reposts;
    private Instant createdAt;
}
