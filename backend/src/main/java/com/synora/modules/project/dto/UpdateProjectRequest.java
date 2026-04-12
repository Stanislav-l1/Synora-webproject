package com.synora.modules.project.dto;

import com.synora.modules.project.entity.ProjectStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdateProjectRequest {

    @Size(max = 200)
    private String name;

    private String description;

    @Size(max = 500)
    private String coverUrl;

    private Boolean isPublic;

    private ProjectStatus status;

    @Size(max = 500)
    private String repoUrl;

    @Size(max = 500)
    private String websiteUrl;

    private List<Long> tagIds;
}
