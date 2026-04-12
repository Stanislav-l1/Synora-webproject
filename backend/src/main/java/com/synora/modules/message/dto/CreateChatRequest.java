package com.synora.modules.message.dto;

import com.synora.modules.message.entity.ChatType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateChatRequest {

    @NotNull
    private ChatType type;

    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String avatarUrl;

    @NotEmpty
    private List<UUID> memberIds;
}
