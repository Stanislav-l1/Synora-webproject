package com.synora.modules.security.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class UserSessionResponse {
    private UUID    id;
    private String  deviceName;
    private String  deviceType;
    private String  ipAddress;
    private Instant lastActiveAt;
    private Instant createdAt;
    private boolean current;
}
