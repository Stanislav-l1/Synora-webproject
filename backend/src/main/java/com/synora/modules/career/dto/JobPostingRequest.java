package com.synora.modules.career.dto;

import com.synora.modules.career.entity.JobStatus;
import com.synora.modules.career.entity.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class JobPostingRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    private String description;

    @Size(max = 150)
    private String company;

    @Size(max = 150)
    private String location;

    private boolean remote = false;

    @NotNull
    private JobType type;

    private JobStatus status = JobStatus.OPEN;

    private Integer salaryMin;
    private Integer salaryMax;
    private String currency = "USD";
    private Short experienceYears;

    @Size(max = 500)
    private String applicationUrl;

    private Set<String> skills;

    private UUID projectId;
}
