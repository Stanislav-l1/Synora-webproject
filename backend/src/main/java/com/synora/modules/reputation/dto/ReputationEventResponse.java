package com.synora.modules.reputation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReputationEventResponse {

    private Long id;
    private String type;
    private short delta;
    private UUID entityId;
    private String entityType;
    private String description;
    private Instant createdAt;
}
