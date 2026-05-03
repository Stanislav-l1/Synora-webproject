package com.synora.modules.git.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.synora.modules.git.entity.GitProvider;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GitRepoResponse {

    private UUID id;
    private UUID userId;
    private GitProvider provider;
    private String externalId;
    private String name;
    private String fullName;
    private String description;
    private String url;
    private String homepageUrl;
    private String language;
    private List<String> topics;
    private int starsCount;
    private int forksCount;
    private int watchersCount;
    private int openIssues;
    private boolean privateRepo;
    private boolean fork;
    private boolean featured;
    private Instant lastPushedAt;
    private Instant syncedAt;
    private Instant createdAt;
}
