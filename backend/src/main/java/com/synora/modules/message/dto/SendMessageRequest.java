package com.synora.modules.message.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class SendMessageRequest {

    @NotBlank
    private String content;

    private UUID replyToId;
}
