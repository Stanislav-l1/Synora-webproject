package com.synora.modules.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PeerReviewDto {
    private UUID id;
    private UUID reviewerId;
    private String reviewerUsername;
    private String reviewerDisplayName;
    private String reviewerAvatarUrl;
    private short score;
    private String context;
    private String comment;
    private Instant createdAt;
}
