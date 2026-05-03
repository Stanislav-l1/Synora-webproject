package com.synora.modules.news.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class CreateNewsRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    private String summary;

    @Size(max = 500)
    private String url;

    @Size(max = 100)
    private String source;

    @Size(max = 500)
    private String imageUrl;

    private Instant publishedAt;

    private List<@Size(max = 50) String> tags;
}
