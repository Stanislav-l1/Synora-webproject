package com.synora.modules.report.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateReportRequest {

    @NotNull
    private UUID entityId;

    @NotBlank
    private String entityType;

    @NotBlank
    @Size(max = 100)
    private String reason;

    @Size(max = 2000)
    private String description;
}
