package com.synora.modules.verification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewVerificationRequest {

    @NotBlank
    private String status;

    @Size(max = 500)
    private String adminNotes;
}
