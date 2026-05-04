package com.synora.modules.security.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PrivacySettingsRequest {
    @Pattern(regexp = "PUBLIC|FOLLOWERS|PRIVATE")
    private String  profileVisibility;
    private Boolean showEmail;
    private Boolean showActivity;
    private Boolean showOnlineStatus;
}
