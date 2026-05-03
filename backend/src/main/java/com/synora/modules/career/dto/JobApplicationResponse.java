package com.synora.modules.career.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.synora.modules.career.entity.ApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobApplicationResponse {

    private UUID id;
    private UUID jobId;
    private String jobTitle;
    private UUID applicantId;
    private String applicantUsername;
    private String applicantDisplayName;
    private String applicantAvatarUrl;
    private String coverLetter;
    private ApplicationStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
