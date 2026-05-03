package com.synora.modules.admin.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminUserResponse {

    private UUID id;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String role;
    private boolean active;
    private boolean banned;
    private String banReason;
    private Instant bannedAt;
    private UUID bannedById;
    private int reputationScore;
    private Instant createdAt;
    private Instant updatedAt;
}
