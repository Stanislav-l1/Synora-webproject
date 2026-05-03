package com.synora.modules.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReputationBreakdownResponse {

    private int totalReputation;

    private int activityScore;
    private int contributionScore;
    private int qualityScore;

    private long endorsementsCount;
    private long peerReviewsCount;
    private double peerReviewAvg;

    private TrustLevel trustLevel;
    private TrustLevel nextLevel;
    private int trustProgressPercent;

    @Getter
    @Builder
    public static class TrustLevel {
        private String code;
        private String title;
        private int minScore;
        private String description;
    }
}
