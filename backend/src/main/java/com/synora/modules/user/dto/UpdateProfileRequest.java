package com.synora.modules.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 100)
    private String displayName;

    @Size(max = 500)
    private String bio;

    @Size(max = 255)
    private String githubUrl;

    @Size(max = 255)
    private String websiteUrl;

    @Size(max = 100)
    private String location;

    @Size(max = 120)
    private String headline;

    @Size(max = 30)
    private String pronouns;

    @Size(max = 120)
    private String availableFor;
}
