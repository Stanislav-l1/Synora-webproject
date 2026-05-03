package com.synora.modules.invite.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InvitationResponse {
    private UUID id;
    private String email;
    private String token;
    private String status;
    private String message;
    private String shareUrl;
    private Instant expiresAt;
    private Instant acceptedAt;
    private Instant createdAt;
}
