package com.synora.modules.project.dto;

import com.synora.modules.post.dto.TagResponse;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter @Builder
public class ProjectSummaryResponse {
    private UUID   id;
    private String ownerUsername;
    private String name;
    private String description;
    private String coverUrl;
    private String status;
    private int    membersCount;
    private int    starsCount;
    private List<TagResponse> tags;
    private Instant createdAt;
}
