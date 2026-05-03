package com.synora.modules.community.dto;

import com.synora.modules.community.entity.CommunityPrivacy;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCommunityRequest {

    @NotBlank
    @Size(min = 3, max = 100)
    private String name;

    @Size(max = 2000)
    private String description;

    private String avatarUrl;
    private String bannerUrl;

    private CommunityPrivacy privacy = CommunityPrivacy.PUBLIC;
}
