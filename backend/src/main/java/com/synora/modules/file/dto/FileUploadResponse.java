package com.synora.modules.file.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FileUploadResponse {

    private UUID id;
    private String originalName;
    private String mimeType;
    private Long sizeBytes;
    private String url;
    private UUID entityId;
    private String entityType;
    private boolean isPublic;
    private Instant createdAt;
}
