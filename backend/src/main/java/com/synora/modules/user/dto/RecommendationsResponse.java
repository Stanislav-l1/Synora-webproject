package com.synora.modules.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecommendationsResponse {

    private List<RecProject> projects;
    private List<RecPost>    posts;
    private List<RecPerson>  people;
    private List<String>     basedOn;

    @Getter
    @Builder
    public static class RecProject {
        private UUID id;
        private String name;
        private String description;
        private int starsCount;
        private int membersCount;
        private List<String> tags;
    }

    @Getter
    @Builder
    public static class RecPost {
        private UUID id;
        private String title;
        private String preview;
        private String authorUsername;
        private String authorDisplayName;
        private List<String> tags;
    }

    @Getter
    @Builder
    public static class RecPerson {
        private UUID id;
        private String username;
        private String displayName;
        private String avatarUrl;
        private String headline;
        private List<String> sharedTags;
    }
}
