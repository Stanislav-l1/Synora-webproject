package com.synora.modules.user.service;

import com.synora.modules.post.entity.Post;
import com.synora.modules.post.entity.PostStatus;
import com.synora.modules.post.entity.Tag;
import com.synora.modules.post.repository.PostRepository;
import com.synora.modules.post.repository.TagRepository;
import com.synora.modules.project.entity.Project;
import com.synora.modules.project.repository.ProjectRepository;
import com.synora.modules.user.dto.RecommendationsResponse;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.entity.UserSkill;
import com.synora.modules.user.repository.UserFollowRepository;
import com.synora.modules.user.repository.UserInterestRepository;
import com.synora.modules.user.repository.UserRepository;
import com.synora.modules.user.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final int LIMIT = 5;

    private final UserRepository userRepository;
    private final UserInterestRepository userInterestRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserFollowRepository userFollowRepository;
    private final TagRepository tagRepository;
    private final PostRepository postRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public RecommendationsResponse getForUser(UUID userId) {
        Set<String> termsLower = collectTermsLower(userId);

        if (termsLower.isEmpty()) {
            return RecommendationsResponse.builder()
                    .projects(List.of())
                    .posts(List.of())
                    .people(List.of())
                    .basedOn(List.of())
                    .build();
        }

        // Lookup matching tag IDs (interests/skills that exist as tags)
        List<Tag> tags = tagRepository.findByNamesLowerIn(termsLower);
        List<Long> tagIds = tags.stream().map(Tag::getId).toList();

        List<RecommendationsResponse.RecProject> projects = tagIds.isEmpty()
                ? List.of()
                : projectRepository.findPublicByTagIdsExcludingOwner(
                        tagIds, userId, PageRequest.of(0, LIMIT))
                .getContent().stream().map(this::toRecProject).toList();

        List<RecommendationsResponse.RecPost> posts = tagIds.isEmpty()
                ? List.of()
                : postRepository.findByStatusAndTagIdsExcludingAuthor(
                        PostStatus.PUBLISHED, tagIds, userId, PageRequest.of(0, LIMIT))
                .getContent().stream().map(this::toRecPost).toList();

        List<RecommendationsResponse.RecPerson> people =
                buildPeopleRecommendations(userId, termsLower);

        List<String> basedOn = tags.stream().map(Tag::getName).toList();

        return RecommendationsResponse.builder()
                .projects(projects)
                .posts(posts)
                .people(people)
                .basedOn(basedOn)
                .build();
    }

    private Set<String> collectTermsLower(UUID userId) {
        Set<String> out = new HashSet<>();
        for (String name : userInterestRepository.findNamesByUserId(userId)) {
            if (name != null && !name.isBlank()) out.add(name.toLowerCase(Locale.ROOT));
        }
        for (UserSkill s : userSkillRepository.findByUserIdOrderByIdAsc(userId)) {
            if (s.getSkillName() != null && !s.getSkillName().isBlank()) {
                out.add(s.getSkillName().toLowerCase(Locale.ROOT));
            }
        }
        return out;
    }

    private List<RecommendationsResponse.RecPerson> buildPeopleRecommendations(
            UUID userId, Set<String> termsLower) {

        List<UUID> bySkill = userSkillRepository
                .findUserIdsBySkillNamesLower(termsLower, userId);
        List<UUID> byInterest = userInterestRepository
                .findUserIdsByInterestNamesLower(termsLower, userId);

        // Score by occurrence count (matches in skills + matches in interests)
        LinkedHashMap<UUID, Integer> scores = new LinkedHashMap<>();
        for (UUID id : bySkill) scores.merge(id, 1, Integer::sum);
        for (UUID id : byInterest) scores.merge(id, 1, Integer::sum);

        if (scores.isEmpty()) return List.of();

        Set<UUID> following = new HashSet<>(userFollowRepository.findFollowingIds(userId));

        List<UUID> ranked = scores.entrySet().stream()
                .filter(e -> !following.contains(e.getKey()))
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(LIMIT)
                .map(java.util.Map.Entry::getKey)
                .toList();

        if (ranked.isEmpty()) return List.of();

        List<User> users = userRepository.findAllById(ranked);
        // Preserve ranked order
        java.util.Map<UUID, User> byId = new java.util.HashMap<>();
        users.forEach(u -> byId.put(u.getId(), u));

        List<RecommendationsResponse.RecPerson> out = new ArrayList<>();
        for (UUID id : ranked) {
            User u = byId.get(id);
            if (u == null) continue;
            List<String> shared = sharedTagsFor(u.getId(), termsLower);
            out.add(RecommendationsResponse.RecPerson.builder()
                    .id(u.getId())
                    .username(u.getUsername())
                    .displayName(u.getDisplayName())
                    .avatarUrl(u.getAvatarUrl())
                    .headline(u.getHeadline())
                    .sharedTags(shared)
                    .build());
        }
        return out;
    }

    private List<String> sharedTagsFor(UUID otherUserId, Set<String> myTermsLower) {
        Set<String> theirTerms = new HashSet<>();
        for (String n : userInterestRepository.findNamesByUserId(otherUserId)) {
            if (n != null) theirTerms.add(n);
        }
        for (UserSkill s : userSkillRepository.findByUserIdOrderByIdAsc(otherUserId)) {
            if (s.getSkillName() != null) theirTerms.add(s.getSkillName());
        }
        List<String> shared = new ArrayList<>();
        for (String t : theirTerms) {
            if (myTermsLower.contains(t.toLowerCase(Locale.ROOT))) shared.add(t);
            if (shared.size() >= 5) break;
        }
        return shared;
    }

    private RecommendationsResponse.RecProject toRecProject(Project p) {
        return RecommendationsResponse.RecProject.builder()
                .id(p.getId())
                .name(p.getName())
                .description(truncate(p.getDescription(), 160))
                .starsCount(p.getStarsCount())
                .membersCount(p.getMembersCount())
                .tags(toTagNames(p.getTags()))
                .build();
    }

    private RecommendationsResponse.RecPost toRecPost(Post p) {
        return RecommendationsResponse.RecPost.builder()
                .id(p.getId())
                .title(p.getTitle())
                .preview(truncate(p.getPreview() != null ? p.getPreview() : p.getContent(), 200))
                .authorUsername(p.getAuthor() != null ? p.getAuthor().getUsername() : null)
                .authorDisplayName(p.getAuthor() != null ? p.getAuthor().getDisplayName() : null)
                .tags(toTagNames(p.getTags()))
                .build();
    }

    private static List<String> toTagNames(Collection<Tag> tags) {
        if (tags == null || tags.isEmpty()) return List.of();
        return tags.stream().map(Tag::getName).toList();
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        if (s.length() <= max) return s;
        return s.substring(0, max - 1) + "…";
    }
}
