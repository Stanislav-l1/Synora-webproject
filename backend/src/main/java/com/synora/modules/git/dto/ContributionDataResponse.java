package com.synora.modules.git.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.synora.modules.git.entity.GitProvider;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContributionDataResponse {

    private UUID id;
    private UUID userId;
    private GitProvider provider;
    private short year;
    private Map<String, Integer> data;
    private Instant syncedAt;
}
