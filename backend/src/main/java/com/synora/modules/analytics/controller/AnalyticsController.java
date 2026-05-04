package com.synora.modules.analytics.controller;

import com.synora.modules.analytics.dto.AnalyticsSummaryResponse;
import com.synora.modules.analytics.dto.PostAnalyticsItem;
import com.synora.modules.analytics.dto.ProjectAnalyticsItem;
import com.synora.modules.analytics.dto.TrackViewRequest;
import com.synora.modules.analytics.service.AnalyticsService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Analytics", description = "Profile, post and project analytics")
@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Operation(summary = "Track a page view (fire-and-forget)")
    @PostMapping("/view")
    public ResponseEntity<Void> trackView(
            @Valid @RequestBody TrackViewRequest req,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {

        String ip = resolveClientIp(httpRequest);
        analyticsService.trackView(
                req.getEntityType(),
                req.getEntityId(),
                currentUser != null ? currentUser.getId() : null,
                ip);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Summary analytics for current user (30-day)")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AnalyticsSummaryResponse>> getSummary(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getSummary(currentUser)));
    }

    @Operation(summary = "Post analytics for current user")
    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<List<PostAnalyticsItem>>> getPosts(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getPostAnalytics(currentUser)));
    }

    @Operation(summary = "Project analytics for current user")
    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<ProjectAnalyticsItem>>> getProjects(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getProjectAnalytics(currentUser)));
    }

    private String resolveClientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }
}
