package com.synora.modules.report.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReportResponse {

    private Long id;
    private UUID reporterId;
    private String reporterUsername;
    private UUID entityId;
    private String entityType;
    private String reason;
    private String description;
    private String status;
    private UUID reviewerId;
    private String reviewerUsername;
    private Instant reviewedAt;
    private Instant createdAt;
}
