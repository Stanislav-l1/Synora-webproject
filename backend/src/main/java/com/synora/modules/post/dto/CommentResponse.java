package com.synora.modules.post.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommentResponse {

    private UUID   id;
    private UUID   parentId;
    private String authorUsername;
    private String authorDisplayName;
    private String authorAvatarUrl;
    private String content;
    private int    likesCount;
    private boolean deleted;
    private Instant createdAt;
    private Instant updatedAt;
}
