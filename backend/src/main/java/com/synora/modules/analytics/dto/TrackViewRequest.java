package com.synora.modules.analytics.dto;

import com.synora.modules.analytics.entity.PageViewEntityType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class TrackViewRequest {
    @NotNull
    private PageViewEntityType entityType;
    @NotNull
    private UUID entityId;
}
