package com.synora.modules.user.service;

import com.synora.modules.post.repository.PostRepository;
import com.synora.modules.project.repository.ProjectRepository;
import com.synora.modules.user.dto.AchievementDto;
import com.synora.modules.user.dto.ProgressResponse;
import com.synora.modules.user.entity.AchievementCode;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.entity.UserAchievement;
import com.synora.modules.user.entity.UserAchievementId;
import com.synora.modules.user.repository.PeerReviewRepository;
import com.synora.modules.user.repository.SkillEndorsementRepository;
import com.synora.modules.user.repository.UserAchievementRepository;
import com.synora.modules.user.repository.UserFollowRepository;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AchievementService {

    private static final List<Level> LEVELS = List.of(
            new Level("NEWCOMER",   "Newcomer",     0),
            new Level("CONTRIBUTOR","Contributor",  50),
            new Level("ACTIVE",     "Active",       200),
            new Level("MAINTAINER", "Maintainer",   500),
            new Level("EXPERT",     "Expert",       2000),
            new Level("MASTER",     "Master",       5000)
    );

    private final UserRepository userRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final PostRepository postRepository;
    private final ProjectRepository projectRepository;
    private final UserFollowRepository userFollowRepository;
    private final SkillEndorsementRepository skillEndorsementRepository;
    private final PeerReviewRepository peerReviewRepository;
    private final ReputationBreakdownService reputationBreakdownService;

    @Transactional
    public ProgressResponse getProgress(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> AppException.notFound("User", userId));

        long postsCount = postRepository.countByAuthorId(userId);
        long ownedProjects = projectRepository.countByOwnerId(userId);
        long currentProjects = projectRepository.countCurrentForUser(userId);
        long followers = userFollowRepository.countByIdFollowingId(userId);
        long endorsements = skillEndorsementRepository.countByUserId(userId);
        long peerReviews = peerReviewRepository.countByRevieweeId(userId);
        Double peerAvgRaw = peerReviewRepository.averageScoreFor(userId);
        double peerAvg = peerAvgRaw == null ? 0.0 : peerAvgRaw;
        boolean trusted = reputationBreakdownService.isAtLeast(userId, "TRUSTED");
        int reputation = user.getReputationScore();
        boolean onboarded = user.isOnboardingCompleted();

        Map<AchievementCode, Boolean> shouldHave = new HashMap<>();
        shouldHave.put(AchievementCode.ONBOARDED,         onboarded);
        shouldHave.put(AchievementCode.FIRST_POST,        postsCount >= 1);
        shouldHave.put(AchievementCode.TEN_POSTS,         postsCount >= 10);
        shouldHave.put(AchievementCode.FIFTY_POSTS,       postsCount >= 50);
        shouldHave.put(AchievementCode.FIRST_FOLLOWER,    followers >= 1);
        shouldHave.put(AchievementCode.TEN_FOLLOWERS,     followers >= 10);
        shouldHave.put(AchievementCode.HUNDRED_FOLLOWERS, followers >= 100);
        shouldHave.put(AchievementCode.FIRST_PROJECT,     ownedProjects >= 1);
        shouldHave.put(AchievementCode.JOINED_PROJECT,    currentProjects >= 1);
        shouldHave.put(AchievementCode.REP_100,           reputation >= 100);
        shouldHave.put(AchievementCode.REP_1000,          reputation >= 1000);
        shouldHave.put(AchievementCode.REP_5000,          reputation >= 5000);
        shouldHave.put(AchievementCode.ENDORSED_10,       endorsements >= 10);
        shouldHave.put(AchievementCode.ENDORSED_50,       endorsements >= 50);
        shouldHave.put(AchievementCode.PEER_RATED,        peerReviews >= 5 && peerAvg >= 4.5);
        shouldHave.put(AchievementCode.TRUSTED_LEVEL,     trusted);

        // Persist any newly-earned ones
        Map<String, Instant> awardedAt = new HashMap<>();
        for (UserAchievement existing :
                userAchievementRepository.findByIdUserIdOrderByAwardedAtDesc(userId)) {
            awardedAt.put(existing.getId().getCode(), existing.getAwardedAt());
        }

        for (Map.Entry<AchievementCode, Boolean> e : shouldHave.entrySet()) {
            String code = e.getKey().name();
            if (Boolean.TRUE.equals(e.getValue()) && !awardedAt.containsKey(code)) {
                UserAchievement saved = userAchievementRepository.save(UserAchievement.builder()
                        .id(new UserAchievementId(userId, code))
                        .build());
                awardedAt.put(code, saved.getAwardedAt() != null ? saved.getAwardedAt() : Instant.now());
            }
        }

        List<AchievementDto> all = Arrays.stream(AchievementCode.values())
                .map(c -> AchievementDto.builder()
                        .code(c.name())
                        .title(c.getTitle())
                        .description(c.getDescription())
                        .icon(c.getIcon())
                        .category(c.getCategory())
                        .unlocked(awardedAt.containsKey(c.name()))
                        .awardedAt(awardedAt.get(c.name()))
                        .build())
                .toList();

        int unlocked = (int) all.stream().filter(AchievementDto::isUnlocked).count();

        Level current = LEVELS.get(0);
        Level next = null;
        for (int i = 0; i < LEVELS.size(); i++) {
            if (reputation >= LEVELS.get(i).minRep) {
                current = LEVELS.get(i);
                next = i + 1 < LEVELS.size() ? LEVELS.get(i + 1) : null;
            }
        }

        int progressPercent;
        int repToNext;
        if (next == null) {
            progressPercent = 100;
            repToNext = 0;
        } else {
            int span = next.minRep - current.minRep;
            int into = reputation - current.minRep;
            progressPercent = span <= 0 ? 100 : Math.max(0, Math.min(100, (into * 100) / span));
            repToNext = Math.max(0, next.minRep - reputation);
        }

        return ProgressResponse.builder()
                .reputation(reputation)
                .currentLevel(toDto(current))
                .nextLevel(next != null ? toDto(next) : null)
                .progressPercent(progressPercent)
                .reputationToNext(repToNext)
                .unlockedCount(unlocked)
                .totalCount(all.size())
                .achievements(new ArrayList<>(all))
                .build();
    }

    private ProgressResponse.CareerLevel toDto(Level lv) {
        return ProgressResponse.CareerLevel.builder()
                .code(lv.code)
                .title(lv.title)
                .minReputation(lv.minRep)
                .build();
    }

    private record Level(String code, String title, int minRep) {}
}
