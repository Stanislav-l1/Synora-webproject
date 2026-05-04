package com.synora.modules.security.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class TwoFactorSetupResponse {
    private String       otpAuthUri;
    private String       secret;
    private List<String> backupCodes;
}
