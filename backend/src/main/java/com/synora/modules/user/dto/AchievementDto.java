package com.synora.modules.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AchievementDto {
    private String code;
    private String title;
    private String description;
    private String icon;
    private String category;
    private boolean unlocked;
    private Instant awardedAt;
}
