package com.synora.modules.community.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.synora.modules.community.entity.CommunityRole;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommunityMemberResponse {

    private UUID          userId;
    private String        username;
    private String        displayName;
    private String        avatarUrl;
    private CommunityRole role;
    private Instant       joinedAt;
}
