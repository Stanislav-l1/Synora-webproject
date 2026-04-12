package com.synora.modules.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class FollowResponse {

    private UUID userId;
    private String username;
    private String displayName;
    private String avatarUrl;
    private Instant followedAt;
}
