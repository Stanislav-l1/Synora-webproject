package com.synora.modules.post.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateCommentRequest {

    @NotBlank
    private String content;

    private UUID parentId;
}
