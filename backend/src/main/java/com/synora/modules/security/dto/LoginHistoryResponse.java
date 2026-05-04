package com.synora.modules.security.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class LoginHistoryResponse {
    private UUID    id;
    private String  ipAddress;
    private String  deviceType;
    private boolean success;
    private String  failureReason;
    private Instant createdAt;
}
