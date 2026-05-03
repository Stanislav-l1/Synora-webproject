package com.synora.modules.subscription.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpgradeRequest {
    @NotBlank
    private String tier; // FREE | PRO | TEAM | BUSINESS
}
