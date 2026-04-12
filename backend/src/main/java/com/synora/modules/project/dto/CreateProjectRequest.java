package com.synora.modules.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateProjectRequest {

    @NotBlank
    @Size(max = 200)
    private String name;

    private String description;

    @Size(max = 500)
    private String coverUrl;

    private boolean isPublic = true;

    @Size(max = 500)
    private String repoUrl;

    @Size(max = 500)
    private String websiteUrl;

    private List<Long> tagIds;
}
