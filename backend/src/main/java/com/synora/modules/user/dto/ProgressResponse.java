package com.synora.modules.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProgressResponse {

    private int reputation;
    private CareerLevel currentLevel;
    private CareerLevel nextLevel;
    private int progressPercent;
    private int reputationToNext;

    private int unlockedCount;
    private int totalCount;
    private List<AchievementDto> achievements;

    @Getter
    @Builder
    public static class CareerLevel {
        private String code;
        private String title;
        private int minReputation;
    }
}
