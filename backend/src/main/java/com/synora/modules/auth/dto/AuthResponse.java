package com.synora.modules.auth.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class AuthResponse {
    private final String accessToken;
    private final String refreshToken;
    @Builder.Default
    private final String tokenType = "Bearer";
    private final long   expiresIn;     // секунды
    private final UUID   userId;
    private final String username;
    private final String role;
}
