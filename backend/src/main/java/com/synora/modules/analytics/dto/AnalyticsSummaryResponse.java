package com.synora.modules.analytics.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AnalyticsSummaryResponse {
    private long   profileViews30d;
    private long   uniqueProfileViewers30d;
    private long   postImpressions30d;
    private long   followerCount;
    private long   followerGrowth30d;
    private int    reputationScore;
    private double engagementRate;
    private List<DayCount> profileViewsByDay;

    @Getter
    @Builder
    public static class DayCount {
        private String date;
        private long   count;
    }
}
