package com.synora.modules.post.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PostSummaryResponse {

    private UUID   id;
    private String authorUsername;
    private String authorDisplayName;
    private String authorAvatarUrl;

    private String title;
    private String preview;
    private String coverUrl;
    private String status;

    private int viewsCount;
    private int likesCount;
    private int commentsCount;
    private int repostsCount;
    private boolean pinned;

    private List<TagResponse> tags;

    private Boolean liked;
    private Boolean bookmarked;
    private Boolean reposted;
    private String  myReaction;
    private Map<String, Long> reactions;

    private PostSummaryResponse repostOf;

    private UUID    communityId;
    private String  communitySlug;
    private String  communityName;

    private Instant createdAt;
}
