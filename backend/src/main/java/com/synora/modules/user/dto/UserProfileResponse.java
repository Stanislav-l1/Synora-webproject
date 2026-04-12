package com.synora.modules.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class UserProfileResponse {
    private UUID    id;
    private String  username;
    private String  displayName;
    private String  avatarUrl;
    private String  bio;
    private String  githubUrl;
    private String  websiteUrl;
    private String  location;
    private int     reputationScore;
    private String  role;
    private Instant createdAt;
}
