package com.synora.modules.subscription.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubscriptionResponse {
    private UUID    id;
    private String  tier;
    private String  status;
    private Instant startedAt;
    private Instant expiresAt;
    private Instant cancelledAt;
}
