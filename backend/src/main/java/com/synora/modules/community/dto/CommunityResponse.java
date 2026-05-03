package com.synora.modules.community.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.synora.modules.community.entity.CommunityPrivacy;
import com.synora.modules.community.entity.CommunityRole;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommunityResponse {

    private UUID            id;
    private String          name;
    private String          slug;
    private String          description;
    private String          avatarUrl;
    private String          bannerUrl;
    private CommunityPrivacy privacy;

    private UUID   ownerId;
    private String ownerUsername;
    private String ownerDisplayName;
    private String ownerAvatarUrl;

    private int membersCount;
    private int postsCount;

    private Boolean      member;
    private CommunityRole myRole;

    private Instant createdAt;
    private Instant updatedAt;
}
