package com.synora.modules.project.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaskResponse {

    private UUID   id;
    private UUID   projectId;
    private Long   columnId;

    private String assigneeUsername;
    private String assigneeDisplayName;
    private String assigneeAvatarUrl;
    private String reporterUsername;

    private String   title;
    private String   description;
    private String   status;
    private String   priority;
    private int      orderIndex;
    private LocalDate dueDate;
    private Short    storyPoints;

    private Instant createdAt;
    private Instant updatedAt;
}
