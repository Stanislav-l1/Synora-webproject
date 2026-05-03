package com.synora.modules.invite.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContactResponse {
    private Long id;
    private String email;
    private String name;
    private String source;
    private UUID matchedUserId;
    private String matchedUsername;
    private String matchedDisplayName;
    private String matchedAvatarUrl;
    private Instant createdAt;
}
