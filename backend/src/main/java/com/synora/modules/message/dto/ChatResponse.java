package com.synora.modules.message.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatResponse {
    private UUID   id;
    private String type;
    private String name;
    private String avatarUrl;
    private UUID   projectId;
    private String projectName;
    private List<ChatMemberResponse> members;
    private MessageResponse lastMessage;
    private long   unreadCount;
    private Instant createdAt;
}
