package com.synora.modules.project.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.synora.modules.post.dto.TagResponse;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectResponse {

    private UUID   id;
    private String ownerUsername;
    private String ownerDisplayName;
    private String ownerAvatarUrl;

    private String  name;
    private String  description;
    private String  coverUrl;
    private String  status;
    private boolean isPublic;
    private String  repoUrl;
    private String  websiteUrl;

    private int membersCount;
    private int starsCount;

    private List<TagResponse> tags;

    private Boolean starred;

    private Instant createdAt;
    private Instant updatedAt;
}
