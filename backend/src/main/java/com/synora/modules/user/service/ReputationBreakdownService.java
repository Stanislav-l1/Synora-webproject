package com.synora.modules.user.service;

import com.synora.modules.post.repository.PostRepository;
import com.synora.modules.project.entity.TaskStatus;
import com.synora.modules.project.repository.ProjectRepository;
import com.synora.modules.project.repository.TaskRepository;
import com.synora.modules.reputation.repository.ReputationEventRepository;
import com.synora.modules.user.dto.ReputationBreakdownResponse;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.PeerReviewRepository;
import com.synora.modules.user.repository.SkillEndorsementRepository;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReputationBreakdownService {

    private static final List<Tier> TIERS = List.of(
            new Tier("NEWBIE",    "Newbie",    0,
                    "Just getting started. Build your profile, post, follow people."),
            new Tier("ESTABLISHED","Established", 100,
                    "Active member with a track record."),
            new Tier("TRUSTED",   "Trusted",   400,
                    "Recognised by peers — quality posts and consistent activity."),
            new Tier("VETERAN",   "Veteran",   1500,
                    "Long-term contributor with strong endorsements."),
            new Tier("MENTOR",    "Mentor",    4000,
                    "Helps others succeed. Peer-reviewed and respected."),
            new Tier("AUTHORITY", "Authority", 10000,
                    "Top reputation tier on Synora.")
    );

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ReputationEventRepository reputationEventRepository;
    private final SkillEndorsementRepository skillEndorsementRepository;
    private final PeerReviewRepository peerReviewRepository;

    @Transactional(readOnly = true)
    public ReputationBreakdownResponse getBreakdown(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> AppException.notFound("User", userId));

        Instant monthAgo = Instant.now().minus(30, ChronoUnit.DAYS);

        long postsLast30d   = postRepository.countByAuthorIdAndCreatedAtAfter(userId, monthAgo);
        int repDelta30d     = reputationEventRepository.sumDeltaByUserIdSince(userId, monthAgo);
        long ownedProjects  = projectRepository.countByOwnerId(userId);
        long currentProjects= projectRepository.countCurrentForUser(userId);
        long doneTasks      = taskRepository.countByAssigneeIdAndStatusIn(
                userId, EnumSet.of(TaskStatus.DONE));
        long endorsements   = skillEndorsementRepository.countByUserId(userId);
        long peerCount      = peerReviewRepository.countByRevieweeId(userId);
        Double peerAvgRaw   = peerReviewRepository.averageScoreFor(userId);
        double peerAvg      = peerAvgRaw == null ? 0.0 : Math.round(peerAvgRaw * 10.0) / 10.0;

        // Activity: recent activity weighted (caps to keep scores readable)
        int activity = (int) Math.min(100,
                postsLast30d * 5 + Math.max(0, repDelta30d / 2));

        // Contribution: project ownership / membership / completed tasks
        int contribution = (int) Math.min(100,
                ownedProjects * 10 + (currentProjects - ownedProjects) * 4 + doneTasks * 2);

        // Quality: endorsements + peer-review avg
        int quality;
        if (peerCount >= 1) {
            quality = (int) Math.min(100,
                    Math.round(peerAvg * 10) + endorsements * 2);
        } else {
            quality = (int) Math.min(100, endorsements * 3);
        }

        // Composite score for trust level
        int reputation = user.getReputationScore();
        int composite = reputation
                + activity / 2
                + contribution
                + quality
                + (int) (endorsements * 5)
                + (int) Math.round(peerAvg * 10) * (int) Math.min(peerCount, 20);

        Tier current = TIERS.get(0);
        Tier next = null;
        for (int i = 0; i < TIERS.size(); i++) {
            if (composite >= TIERS.get(i).minScore) {
                current = TIERS.get(i);
                next = i + 1 < TIERS.size() ? TIERS.get(i + 1) : null;
            }
        }

        int progressPct;
        if (next == null) {
            progressPct = 100;
        } else {
            int span = next.minScore - current.minScore;
            int into = composite - current.minScore;
            progressPct = span <= 0 ? 100 : Math.max(0, Math.min(100, (into * 100) / span));
        }

        return ReputationBreakdownResponse.builder()
                .totalReputation(reputation)
                .activityScore(activity)
                .contributionScore(contribution)
                .qualityScore(quality)
                .endorsementsCount(endorsements)
                .peerReviewsCount(peerCount)
                .peerReviewAvg(peerAvg)
                .trustLevel(toDto(current))
                .nextLevel(next != null ? toDto(next) : null)
                .trustProgressPercent(progressPct)
                .build();
    }

    private ReputationBreakdownResponse.TrustLevel toDto(Tier t) {
        return ReputationBreakdownResponse.TrustLevel.builder()
                .code(t.code).title(t.title).minScore(t.minScore).description(t.description)
                .build();
    }

    // Used by AchievementService to award TRUSTED
    @Transactional(readOnly = true)
    public boolean isAtLeast(UUID userId, String tierCode) {
        ReputationBreakdownResponse br = getBreakdown(userId);
        int targetMin = TIERS.stream()
                .filter(t -> t.code.equals(tierCode))
                .mapToInt(t -> t.minScore)
                .findFirst().orElse(Integer.MAX_VALUE);
        // Compute composite again on totals from breakdown — approximate: rely on trustLevel.minScore >= target
        return br.getTrustLevel() != null && br.getTrustLevel().getMinScore() >= targetMin;
    }

    private record Tier(String code, String title, int minScore, String description) {}
}
