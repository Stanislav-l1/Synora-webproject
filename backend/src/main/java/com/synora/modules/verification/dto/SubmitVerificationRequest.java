package com.synora.modules.verification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubmitVerificationRequest {

    @NotBlank
    private String type;

    @Size(max = 1000)
    private String notes;
}
