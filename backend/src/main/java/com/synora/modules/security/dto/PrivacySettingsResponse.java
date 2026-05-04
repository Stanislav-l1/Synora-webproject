package com.synora.modules.security.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PrivacySettingsResponse {
    private String  profileVisibility;
    private boolean showEmail;
    private boolean showActivity;
    private boolean showOnlineStatus;
}
