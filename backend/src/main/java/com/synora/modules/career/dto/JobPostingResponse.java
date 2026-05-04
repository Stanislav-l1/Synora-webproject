package com.synora.modules.career.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.synora.modules.career.entity.JobStatus;
import com.synora.modules.career.entity.JobType;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobPostingResponse {

    private UUID id;
    private UUID authorId;
    private String authorUsername;
    private String authorDisplayName;
    private String authorAvatarUrl;
    private UUID projectId;
    private String title;
    private String description;
    private String company;
    private String location;
    private boolean remote;
    private JobType type;
    private JobStatus status;
    private Integer salaryMin;
    private Integer salaryMax;
    private String currency;
    private Short experienceYears;
    private String applicationUrl;
    private int applicationsCount;
    private int viewsCount;
    private Set<String> skills;
    private boolean applied;
    private boolean saved;
    private Instant createdAt;
    private Instant updatedAt;
}
