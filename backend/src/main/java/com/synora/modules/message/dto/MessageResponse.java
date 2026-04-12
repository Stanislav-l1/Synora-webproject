package com.synora.modules.message.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MessageResponse {
    private UUID    id;
    private UUID    chatId;
    private String  senderUsername;
    private String  senderDisplayName;
    private String  senderAvatarUrl;
    private UUID    replyToId;
    private String  replyToContent;
    private String  content;
    private boolean deleted;
    private Instant editedAt;
    private Instant createdAt;
}
