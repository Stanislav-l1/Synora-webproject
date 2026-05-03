package com.synora.modules.calendar.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RespondToInviteRequest {
    /** ACCEPTED | DECLINED | TENTATIVE */
    @NotBlank
    private String status;
}
