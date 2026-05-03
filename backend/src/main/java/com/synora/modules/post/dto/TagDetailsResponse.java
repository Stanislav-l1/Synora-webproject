package com.synora.modules.post.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TagDetailsResponse {

    private TagResponse tag;

    private long totalPosts;
    private long totalProjects;
    private long postsLast24h;
    private long postsLast7d;
    private double growthPercent;

    private List<TagPostSummary>    posts;
    private List<TagPostSummary>    discussions;
    private List<TagProjectSummary> projects;
    private List<TagSpecialist>     specialists;

    @Getter
    @Builder
    public static class TagPostSummary {
        private UUID id;
        private String title;
        private String preview;
        private String authorUsername;
        private String authorDisplayName;
        private int likesCount;
        private int commentsCount;
        private java.time.Instant createdAt;
    }

    @Getter
    @Builder
    public static class TagProjectSummary {
        private UUID id;
        private String name;
        private String description;
        private int starsCount;
        private int membersCount;
    }

    @Getter
    @Builder
    public static class TagSpecialist {
        private UUID id;
        private String username;
        private String displayName;
        private String avatarUrl;
        private String headline;
        private int reputationScore;
        private String matchedVia; // "skill" | "interest"
    }
}
