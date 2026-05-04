package com.synora.modules.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private final String  accessToken;
    private final String  refreshToken;
    @Builder.Default
    private final String  tokenType = "Bearer";
    private final Long    expiresIn;
    private final UUID    userId;
    private final String  username;
    private final String  role;
    // Set when 2FA is required — all other fields are null in that case
    private final Boolean requiresTwoFactor;
    private final String  twoFactorToken;
}
