package com.synora.modules.message.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter @Builder
public class ChatMemberResponse {
    private UUID    userId;
    private String  username;
    private String  displayName;
    private String  avatarUrl;
    private boolean admin;
    private boolean muted;
    private Instant joinedAt;
    private Instant lastReadAt;
}
