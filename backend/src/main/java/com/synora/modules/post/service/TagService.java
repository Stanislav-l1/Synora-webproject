package com.synora.modules.post.service;

import com.synora.modules.post.dto.TagDetailsResponse;
import com.synora.modules.post.dto.TagResponse;
import com.synora.modules.post.entity.Post;
import com.synora.modules.post.entity.PostStatus;
import com.synora.modules.post.entity.Tag;
import com.synora.modules.post.repository.PostRepository;
import com.synora.modules.post.repository.TagRepository;
import com.synora.modules.project.entity.Project;
import com.synora.modules.project.repository.ProjectRepository;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserInterestRepository;
import com.synora.modules.user.repository.UserRepository;
import com.synora.modules.user.repository.UserSkillRepository;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final PostRepository postRepository;
    private final ProjectRepository projectRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserInterestRepository userInterestRepository;
    private final UserRepository userRepository;

    @Cacheable("tags")
    @Transactional(readOnly = true)
    public List<TagResponse> getAllTags() {
        return tagRepository.findAllByOrderByUsageCountDesc()
                .stream().map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TagResponse> searchTags(String query) {
        return tagRepository.findByNameContainingIgnoreCaseOrderByUsageCountDesc(query)
                .stream().map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TagDetailsResponse getDetails(String name) {
        Tag tag = tagRepository.findByName(name)
                .orElseThrow(() -> AppException.notFound("Tag", name));

        Instant now = Instant.now();
        Instant day = now.minus(1, ChronoUnit.DAYS);
        Instant week = now.minus(7, ChronoUnit.DAYS);
        Instant prevWeek = now.minus(14, ChronoUnit.DAYS);

        long total      = postRepository.countByStatusAndTagId(PostStatus.PUBLISHED, tag.getId());
        long postsDay   = postRepository.countByStatusAndTagIdSince(PostStatus.PUBLISHED, tag.getId(), day);
        long postsWeek  = postRepository.countByStatusAndTagIdSince(PostStatus.PUBLISHED, tag.getId(), week);
        long postsPrev  = postRepository.countByStatusAndTagIdSince(PostStatus.PUBLISHED, tag.getId(), prevWeek)
                          - postsWeek;
        long projectsCount = projectRepository.countPublicByTagId(tag.getId());

        double growth;
        if (postsPrev <= 0) {
            growth = postsWeek > 0 ? 100.0 : 0.0;
        } else {
            growth = ((postsWeek - postsPrev) * 100.0) / postsPrev;
        }

        List<TagDetailsResponse.TagPostSummary> postSummaries =
                postRepository.findByStatusAndTagId(PostStatus.PUBLISHED, tag.getId(),
                        PageRequest.of(0, 10))
                        .getContent().stream().map(this::toPostSummary).toList();

        List<TagDetailsResponse.TagPostSummary> discussions =
                postRepository.findMostDiscussedByStatusAndTagId(PostStatus.PUBLISHED, tag.getId(),
                        PageRequest.of(0, 10))
                        .getContent().stream().map(this::toPostSummary).toList();

        List<TagDetailsResponse.TagProjectSummary> projectSummaries =
                projectRepository.findPublicByTagId(tag.getId(), PageRequest.of(0, 6))
                        .getContent().stream().map(this::toProjectSummary).toList();

        List<TagDetailsResponse.TagSpecialist> specialists = topSpecialists(tag.getName());

        return TagDetailsResponse.builder()
                .tag(toResponse(tag))
                .totalPosts(total)
                .totalProjects(projectsCount)
                .postsLast24h(postsDay)
                .postsLast7d(postsWeek)
                .growthPercent(round1(growth))
                .posts(postSummaries)
                .discussions(discussions)
                .projects(projectSummaries)
                .specialists(specialists)
                .build();
    }

    private List<TagDetailsResponse.TagSpecialist> topSpecialists(String tagName) {
        String lower = tagName.toLowerCase(Locale.ROOT);
        Set<String> oneName = Set.of(lower);

        List<UUID> bySkill    = userSkillRepository.findUserIdsBySkillNamesLower(oneName, new UUID(0, 0));
        List<UUID> byInterest = userInterestRepository.findUserIdsByInterestNamesLower(oneName, new UUID(0, 0));

        Set<UUID> orderedIds = new LinkedHashSet<>();
        orderedIds.addAll(bySkill);
        orderedIds.addAll(byInterest);

        if (orderedIds.isEmpty()) return List.of();

        Map<UUID, String> matchVia = new HashMap<>();
        for (UUID id : bySkill) matchVia.put(id, "skill");
        for (UUID id : byInterest) matchVia.putIfAbsent(id, "interest");

        List<UUID> ids = new ArrayList<>(orderedIds);
        List<User> users = userRepository.findAllById(ids);

        return users.stream()
                .sorted((a, b) -> Integer.compare(b.getReputationScore(), a.getReputationScore()))
                .limit(8)
                .map(u -> TagDetailsResponse.TagSpecialist.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .displayName(u.getDisplayName())
                        .avatarUrl(u.getAvatarUrl())
                        .headline(u.getHeadline())
                        .reputationScore(u.getReputationScore())
                        .matchedVia(matchVia.getOrDefault(u.getId(), "skill"))
                        .build())
                .toList();
    }

    private TagDetailsResponse.TagPostSummary toPostSummary(Post p) {
        return TagDetailsResponse.TagPostSummary.builder()
                .id(p.getId())
                .title(p.getTitle())
                .preview(truncate(p.getPreview() != null ? p.getPreview() : p.getContent(), 200))
                .authorUsername(p.getAuthor() != null ? p.getAuthor().getUsername() : null)
                .authorDisplayName(p.getAuthor() != null ? p.getAuthor().getDisplayName() : null)
                .likesCount(p.getLikesCount())
                .commentsCount(p.getCommentsCount())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private TagDetailsResponse.TagProjectSummary toProjectSummary(Project p) {
        return TagDetailsResponse.TagProjectSummary.builder()
                .id(p.getId())
                .name(p.getName())
                .description(truncate(p.getDescription(), 160))
                .starsCount(p.getStarsCount())
                .membersCount(p.getMembersCount())
                .build();
    }

    private TagResponse toResponse(Tag t) {
        return TagResponse.builder()
                .id(t.getId()).name(t.getName())
                .color(t.getColor()).usageCount(t.getUsageCount())
                .build();
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        if (s.length() <= max) return s;
        return s.substring(0, max - 1) + "…";
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
