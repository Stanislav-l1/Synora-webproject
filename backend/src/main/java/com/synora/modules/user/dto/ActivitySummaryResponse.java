package com.synora.modules.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ActivitySummaryResponse {

    private long postsThisWeek;
    private int reputationDeltaThisWeek;
    private long openTasks;
    private long upcomingDeadlines;
    private long currentProjects;
    private long unreadMessages;

    private List<UpcomingTask> upcomingTasks;
    private List<CurrentProject> currentProjectsList;

    @Getter
    @Builder
    public static class UpcomingTask {
        private UUID id;
        private String title;
        private LocalDate dueDate;
        private String status;
        private String priority;
        private UUID projectId;
        private String projectName;
    }

    @Getter
    @Builder
    public static class CurrentProject {
        private UUID id;
        private String name;
        private String role;
        private int membersCount;
        private int starsCount;
        private Instant updatedAt;
    }
}
