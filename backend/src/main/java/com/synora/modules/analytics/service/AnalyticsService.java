package com.synora.modules.analytics.service;

import com.synora.modules.analytics.dto.AnalyticsSummaryResponse;
import com.synora.modules.analytics.dto.PostAnalyticsItem;
import com.synora.modules.analytics.dto.ProjectAnalyticsItem;
import com.synora.modules.analytics.entity.PageView;
import com.synora.modules.analytics.entity.PageViewEntityType;
import com.synora.modules.analytics.repository.PageViewRepository;
import com.synora.modules.post.entity.Post;
import com.synora.modules.post.entity.PostStatus;
import com.synora.modules.post.repository.PostRepository;
import org.springframework.data.domain.Page;
import com.synora.modules.project.repository.ProjectRepository;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserFollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PageViewRepository  pageViewRepository;
    private final PostRepository      postRepository;
    private final ProjectRepository   projectRepository;
    private final UserFollowRepository followRepository;

    @Async
    @Transactional
    public void trackView(PageViewEntityType type, UUID entityId, UUID viewerId, String ip) {
        if (viewerId != null) {
            boolean recent = pageViewRepository.existsByEntityTypeAndEntityIdAndViewerIdAndViewedAtAfter(
                    type, entityId, viewerId, Instant.now().minus(1, ChronoUnit.HOURS));
            if (recent) return;
        }
        pageViewRepository.save(PageView.builder()
                .entityType(type)
                .entityId(entityId)
                .viewerId(viewerId)
                .ipAddress(ip)
                .build());
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary(User user) {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        UUID userId = user.getId();

        long profileViews   = pageViewRepository.countByEntityTypeAndEntityIdAndViewedAtAfter(
                PageViewEntityType.PROFILE, userId, thirtyDaysAgo);
        long uniqueViewers  = pageViewRepository.countUniqueViewers(
                PageViewEntityType.PROFILE, userId, thirtyDaysAgo);
        long followerCount  = followRepository.countByIdFollowingId(userId);
        long followerGrowth = followRepository.countByIdFollowingIdAndCreatedAtAfter(userId, thirtyDaysAgo);

        PageRequest pageable = PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts = postRepository.findByAuthorIdAndStatus(userId, PostStatus.PUBLISHED, pageable);

        long impressions = posts.stream().mapToLong(p -> (long) p.getViewsCount()).sum();
        long likes       = posts.stream().mapToLong(p -> (long) p.getLikesCount()).sum();
        long comments    = posts.stream().mapToLong(p -> (long) p.getCommentsCount()).sum();
        double engRate   = impressions > 0 ? Math.round((likes + comments) * 1000.0 / impressions) / 10.0 : 0.0;

        List<Object[]> rawDays = pageViewRepository.countByDayForEntity(
                PageViewEntityType.PROFILE.name(), userId, thirtyDaysAgo);
        List<AnalyticsSummaryResponse.DayCount> viewsByDay = rawDays.stream()
                .map(r -> AnalyticsSummaryResponse.DayCount.builder()
                        .date((String) r[0])
                        .count(((Number) r[1]).longValue())
                        .build())
                .collect(Collectors.toList());

        return AnalyticsSummaryResponse.builder()
                .profileViews30d(profileViews)
                .uniqueProfileViewers30d(uniqueViewers)
                .postImpressions30d(impressions)
                .followerCount(followerCount)
                .followerGrowth30d(followerGrowth)
                .reputationScore(user.getReputationScore())
                .engagementRate(engRate)
                .profileViewsByDay(viewsByDay)
                .build();
    }

    @Transactional(readOnly = true)
    public List<PostAnalyticsItem> getPostAnalytics(User user) {
        PageRequest pageable = PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepository
                .findByAuthorIdAndStatus(user.getId(), PostStatus.PUBLISHED, pageable)
                .stream()
                .map(p -> PostAnalyticsItem.builder()
                        .id(p.getId())
                        .title(p.getTitle())
                        .views(p.getViewsCount())
                        .likes(p.getLikesCount())
                        .comments(p.getCommentsCount())
                        .reposts(p.getRepostsCount())
                        .createdAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectAnalyticsItem> getProjectAnalytics(User user) {
        PageRequest pageable = PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt"));
        return projectRepository
                .findByOwnerUsername(user.getUsername(), pageable)
                .stream()
                .map(p -> ProjectAnalyticsItem.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .members(p.getMembersCount())
                        .stars(p.getStarsCount())
                        .createdAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
