package com.synora.modules.news.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NewsItemResponse {
    private UUID id;
    private String title;
    private String summary;
    private String url;
    private String source;
    private String imageUrl;
    private Instant publishedAt;
    private List<String> tags;
}
