package com.synora.modules.verification.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VerificationResponse {
    private UUID    id;
    private String  type;
    private String  status;
    private String  notes;
    private String  adminNotes;
    private Instant reviewedAt;
    private Instant createdAt;
    private String  username;
    private String  displayName;
    private String  avatarUrl;
}
