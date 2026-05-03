package com.synora.modules.user.controller;

import com.synora.modules.user.dto.ActivitySummaryResponse;
import com.synora.modules.user.dto.AddSkillRequest;
import com.synora.modules.user.dto.OnboardingRequest;
import com.synora.modules.user.dto.CreatePeerReviewRequest;
import com.synora.modules.user.dto.EndorsementSummary;
import com.synora.modules.user.dto.PeerReviewDto;
import com.synora.modules.user.dto.ProgressResponse;
import com.synora.modules.user.dto.RecommendationsResponse;
import com.synora.modules.user.dto.ReputationBreakdownResponse;
import com.synora.modules.user.dto.SkillDto;
import com.synora.modules.user.dto.UpdateProfileRequest;
import com.synora.modules.user.dto.UserProfileResponse;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.service.AchievementService;
import com.synora.modules.user.service.ActivitySummaryService;
import com.synora.modules.user.service.EndorsementService;
import com.synora.modules.user.service.PeerReviewService;
import com.synora.modules.user.service.RecommendationService;
import com.synora.modules.user.service.ReputationBreakdownService;
import com.synora.modules.user.service.UserService;
import com.synora.shared.dto.ApiResponse;
import com.synora.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Tag(name = "Users", description = "User profile management")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ActivitySummaryService activitySummaryService;
    private final AchievementService achievementService;
    private final RecommendationService recommendationService;
    private final EndorsementService endorsementService;
    private final PeerReviewService peerReviewService;
    private final ReputationBreakdownService reputationBreakdownService;

    @Operation(summary = "Get user profile by username")
    @GetMapping("/{username}/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @PathVariable String username) {

        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(username)));
    }

    @Operation(summary = "Get user profile by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getById(
            @PathVariable UUID id) {

        return ResponseEntity.ok(ApiResponse.ok(userService.getProfileById(id)));
    }

    @Operation(summary = "Update own profile", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateProfileRequest req) {

        return ResponseEntity.ok(
                ApiResponse.ok("Profile updated", userService.updateProfile(currentUser, req)));
    }

    @Operation(summary = "Complete onboarding", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/me/onboarding")
    public ResponseEntity<ApiResponse<UserProfileResponse>> completeOnboarding(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody OnboardingRequest req) {

        return ResponseEntity.ok(
                ApiResponse.ok("Onboarding completed", userService.completeOnboarding(currentUser, req)));
    }

    @Operation(summary = "Top users by reputation")
    @GetMapping("/top")
    public ResponseEntity<ApiResponse<PageResponse<UserProfileResponse>>> topUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(userService.getTopByReputation(page, size)));
    }

    @Operation(summary = "Suggested users to follow")
    @GetMapping("/suggested")
    public ResponseEntity<ApiResponse<java.util.List<UserProfileResponse>>> suggested(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "3") int limit) {
        int capped = Math.max(1, Math.min(limit, 20));
        UUID excludeId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(userService.getSuggested(excludeId, capped)));
    }

    @Operation(summary = "Aggregate stats for a user")
    @GetMapping("/{id}/stats")
    public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> stats(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getStats(id)));
    }

    @Operation(summary = "Activity summary (dashboard) for a user",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/{id}/activity-summary")
    public ResponseEntity<ApiResponse<ActivitySummaryResponse>> activitySummary(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(activitySummaryService.getSummary(id)));
    }

    @Operation(summary = "Achievements + career progress for a user")
    @GetMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<ProgressResponse>> progress(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(achievementService.getProgress(id)));
    }

    @Operation(summary = "Recommendations for current user (projects, posts, people)",
            security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/me/recommendations")
    public ResponseEntity<ApiResponse<RecommendationsResponse>> recommendations(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
                ApiResponse.ok(recommendationService.getForUser(currentUser.getId())));
    }

    // --- Reputation breakdown ---

    @Operation(summary = "Reputation breakdown (activity, contribution, quality, trust level)")
    @GetMapping("/{id}/reputation/breakdown")
    public ResponseEntity<ApiResponse<ReputationBreakdownResponse>> reputationBreakdown(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(reputationBreakdownService.getBreakdown(id)));
    }

    // --- Endorsements ---

    @Operation(summary = "List skills with endorsement counts for a user")
    @GetMapping("/{id}/endorsements")
    public ResponseEntity<ApiResponse<java.util.List<EndorsementSummary>>> listEndorsements(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        UUID viewerId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(endorsementService.listForUser(id, viewerId)));
    }

    @Operation(summary = "Endorse a skill",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/skills/{skillId}/endorse")
    public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> endorse(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long skillId) {
        long count = endorsementService.endorse(currentUser, skillId);
        return ResponseEntity.ok(ApiResponse.ok(java.util.Map.of("count", count)));
    }

    @Operation(summary = "Remove endorsement of a skill",
            security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/skills/{skillId}/endorse")
    public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> unendorse(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long skillId) {
        long count = endorsementService.unendorse(currentUser, skillId);
        return ResponseEntity.ok(ApiResponse.ok(java.util.Map.of("count", count)));
    }

    // --- Peer reviews ---

    @Operation(summary = "List peer reviews for a user")
    @GetMapping("/{id}/peer-reviews")
    public ResponseEntity<ApiResponse<PageResponse<PeerReviewDto>>> listPeerReviews(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(peerReviewService.listFor(id, page, size)));
    }

    @Operation(summary = "Submit / update a peer review",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{id}/peer-reviews")
    public ResponseEntity<ApiResponse<PeerReviewDto>> submitPeerReview(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody CreatePeerReviewRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                peerReviewService.submit(currentUser, id, req)));
    }

    @Operation(summary = "Delete a peer review you authored",
            security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/peer-reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deletePeerReview(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID reviewId) {
        peerReviewService.delete(currentUser, reviewId);
        return ResponseEntity.ok(ApiResponse.ok("Review deleted", null));
    }

    // --- Skills ---

    @Operation(summary = "List skills of a user")
    @GetMapping("/{id}/skills")
    public ResponseEntity<ApiResponse<java.util.List<SkillDto>>> listSkills(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.listSkills(id)));
    }

    @Operation(summary = "Add skill to own profile", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/me/skills")
    public ResponseEntity<ApiResponse<SkillDto>> addSkill(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody AddSkillRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(userService.addSkill(currentUser, req)));
    }

    @Operation(summary = "Remove skill from own profile", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/me/skills/{skillId}")
    public ResponseEntity<ApiResponse<Void>> removeSkill(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long skillId) {
        userService.removeSkill(currentUser, skillId);
        return ResponseEntity.ok(ApiResponse.ok("Skill removed", null));
    }

    // --- Export & vCard ---

    @Operation(summary = "Export own profile as JSON", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/me/export")
    public ResponseEntity<Map<String, Object>> exportProfile(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"synora-profile-" + currentUser.getUsername() + ".json\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(userService.exportProfile(currentUser));
    }

    @Operation(summary = "Download vCard for a user")
    @GetMapping(value = "/{username}/vcard", produces = "text/vcard;charset=UTF-8")
    public ResponseEntity<String> vcard(@PathVariable String username) {
        User user = userService.findByUsername(username);
        String vcard = buildVCard(user);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + user.getUsername() + ".vcf\"")
                .body(vcard);
    }

    private static String buildVCard(User u) {
        String name = u.getDisplayName() != null ? u.getDisplayName() : u.getUsername();
        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCARD\r\n");
        sb.append("VERSION:3.0\r\n");
        sb.append("FN:").append(escape(name)).append("\r\n");
        sb.append("N:").append(escape(name)).append(";;;;\r\n");
        sb.append("NICKNAME:").append(escape(u.getUsername())).append("\r\n");
        if (u.getHeadline() != null) sb.append("TITLE:").append(escape(u.getHeadline())).append("\r\n");
        if (u.getEmail() != null)    sb.append("EMAIL;TYPE=INTERNET:").append(escape(u.getEmail())).append("\r\n");
        if (u.getWebsiteUrl() != null) sb.append("URL:").append(escape(u.getWebsiteUrl())).append("\r\n");
        if (u.getGithubUrl() != null)  sb.append("URL;TYPE=github:").append(escape(u.getGithubUrl())).append("\r\n");
        if (u.getLocation() != null)   sb.append("ADR;TYPE=home:;;").append(escape(u.getLocation())).append(";;;;\r\n");
        if (u.getBio() != null)        sb.append("NOTE:").append(escape(u.getBio())).append("\r\n");
        sb.append("END:VCARD\r\n");
        return sb.toString();
    }

    private static String escape(String s) {
        return s.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;").replace("\n", "\\n");
    }
}
