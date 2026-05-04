package com.synora.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TwoFactorCompleteRequest {
    @NotBlank
    private String twoFactorToken;
    @NotBlank
    private String code;
}
