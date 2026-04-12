package com.synora.modules.message.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Payload sent over STOMP to /app/chat/{chatId}/send
 */
@Getter @Builder
@NoArgsConstructor @AllArgsConstructor
public class WsMessage {
    private String content;
    private UUID   replyToId;
}
