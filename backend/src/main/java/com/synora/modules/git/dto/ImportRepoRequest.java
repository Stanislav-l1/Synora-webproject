package com.synora.modules.git.dto;

import com.synora.modules.git.entity.GitProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ImportRepoRequest {

    @NotNull
    private GitProvider provider;

    @NotBlank
    private String externalId;

    @NotBlank
    private String name;

    private String fullName;
    private String description;

    @NotBlank
    private String url;

    private String homepageUrl;
    private String language;
    private java.util.List<String> topics;
    private int starsCount;
    private int forksCount;
    private int watchersCount;
    private int openIssues;
    private boolean privateRepo;
    private boolean fork;
    private java.time.Instant lastPushedAt;
}
