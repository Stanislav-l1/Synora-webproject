package com.synora.modules.project.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter @Builder
public class ProjectMemberResponse {
    private UUID    userId;
    private String  username;
    private String  displayName;
    private String  avatarUrl;
    private String  role;
    private Instant joinedAt;
}
