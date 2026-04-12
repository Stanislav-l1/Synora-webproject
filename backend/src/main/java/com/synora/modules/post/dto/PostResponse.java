package com.synora.modules.post.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PostResponse {

    private UUID   id;
    private String authorUsername;
    private String authorDisplayName;
    private String authorAvatarUrl;

    private String title;
    private String content;
    private String preview;
    private String coverUrl;
    private String status;

    private int  viewsCount;
    private int  likesCount;
    private int  commentsCount;
    private boolean pinned;

    private List<TagResponse> tags;

    private Boolean liked;
    private Boolean bookmarked;

    private Instant createdAt;
    private Instant updatedAt;
}
