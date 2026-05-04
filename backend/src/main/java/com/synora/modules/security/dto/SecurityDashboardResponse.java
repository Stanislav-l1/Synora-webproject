package com.synora.modules.security.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SecurityDashboardResponse {
    private boolean twoFactorEnabled;
    private long    activeSessions;
    private long    failedLoginsLast24h;
    private boolean profilePublic;
}
