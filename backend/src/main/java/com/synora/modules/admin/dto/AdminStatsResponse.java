package com.synora.modules.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStatsResponse {

    private long totalUsers;
    private long bannedUsers;
    private long newUsersLast7Days;

    private long totalPosts;
    private long totalProjects;
    private long totalCommunities;

    private long totalReports;
    private long pendingReports;
}
