package com.synora.modules.user.service;

import com.synora.modules.post.repository.PostRepository;
import com.synora.modules.project.repository.ProjectRepository;
import com.synora.modules.user.dto.AddSkillRequest;
import com.synora.modules.user.dto.SkillDto;
import com.synora.modules.user.dto.UpdateProfileRequest;
import com.synora.modules.user.dto.UserProfileResponse;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.entity.UserInterest;
import com.synora.modules.user.entity.UserInterestId;
import com.synora.modules.user.entity.UserSkill;
import com.synora.modules.user.repository.UserFollowRepository;
import com.synora.modules.user.repository.UserInterestRepository;
import com.synora.modules.user.repository.UserRepository;
import com.synora.modules.user.repository.UserSkillRepository;
import com.synora.modules.user.dto.OnboardingRequest;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ProjectRepository projectRepository;
    private final UserFollowRepository userFollowRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserInterestRepository userInterestRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> AppException.notFound("User", username));
        return toResponse(user, true);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfileById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User", id));
        return toResponse(user, true);
    }

    @CacheEvict(value = "users", allEntries = true)
    @Transactional
    public UserProfileResponse updateProfile(User currentUser, UpdateProfileRequest req) {
        if (req.getDisplayName() != null) currentUser.setDisplayName(req.getDisplayName());
        if (req.getBio()         != null) currentUser.setBio(req.getBio());
        if (req.getGithubUrl()   != null) currentUser.setGithubUrl(req.getGithubUrl());
        if (req.getWebsiteUrl()  != null) currentUser.setWebsiteUrl(req.getWebsiteUrl());
        if (req.getLocation()    != null) currentUser.setLocation(req.getLocation());
        if (req.getHeadline()    != null) currentUser.setHeadline(req.getHeadline());
        if (req.getPronouns()    != null) currentUser.setPronouns(req.getPronouns());
        if (req.getAvailableFor()!= null) currentUser.setAvailableFor(req.getAvailableFor());

        return toResponse(userRepository.save(currentUser), true);
    }

    @Transactional
    public SkillDto addSkill(User currentUser, AddSkillRequest req) {
        String name = req.getName().trim();
        return userSkillRepository.findByUserIdAndSkillName(currentUser.getId(), name)
                .map(existing -> {
                    if (req.getLevel() != null) existing.setLevel(req.getLevel());
                    return toSkillDto(userSkillRepository.save(existing));
                })
                .orElseGet(() -> toSkillDto(userSkillRepository.save(UserSkill.builder()
                        .userId(currentUser.getId())
                        .skillName(name)
                        .level(req.getLevel())
                        .build())));
    }

    @Transactional
    public void removeSkill(User currentUser, Long skillId) {
        UserSkill skill = userSkillRepository.findById(skillId)
                .orElseThrow(() -> AppException.notFound("Skill", skillId));
        if (!skill.getUserId().equals(currentUser.getId())) {
            throw AppException.forbidden();
        }
        userSkillRepository.delete(skill);
    }

    @Transactional(readOnly = true)
    public List<SkillDto> listSkills(UUID userId) {
        return userSkillRepository.findByUserIdOrderByIdAsc(userId).stream()
                .map(this::toSkillDto).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<UserProfileResponse> getTopByReputation(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reputationScore"));
        return PageResponse.from(userRepository.findAll(pageable).map(u -> toResponse(u, false)));
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getSuggested(UUID excludeUserId, int limit) {
        LinkedHashMap<UUID, UserProfileResponse> out = new LinkedHashMap<>();

        if (excludeUserId != null) {
            List<UUID> already = userFollowRepository.findFollowingIds(excludeUserId);
            Set<UUID> skip = new HashSet<>(already);
            skip.add(excludeUserId);

            List<UUID> fof = userFollowRepository.findFriendsOfFriends(excludeUserId, limit * 2);
            for (UUID id : fof) {
                if (out.size() >= limit) break;
                if (skip.contains(id)) continue;
                userRepository.findById(id).ifPresent(u -> out.put(id, toResponse(u, false)));
            }
        }

        if (out.size() < limit) {
            var pageable = PageRequest.of(0, limit * 2,
                    Sort.by(Sort.Direction.DESC, "reputationScore"));
            userRepository.findAll(pageable).forEach(u -> {
                if (out.size() >= limit) return;
                if (excludeUserId != null && u.getId().equals(excludeUserId)) return;
                out.putIfAbsent(u.getId(), toResponse(u, false));
            });
        }

        return new ArrayList<>(out.values());
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getStats(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> AppException.notFound("User", userId));
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("posts", postRepository.countByAuthorId(userId));
        stats.put("projects", projectRepository.countByOwnerId(userId));
        stats.put("followers", userFollowRepository.countByIdFollowingId(userId));
        stats.put("reputation", (long) user.getReputationScore());
        return stats;
    }

    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> AppException.notFound("User", username));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> exportProfile(User currentUser) {
        UserProfileResponse profile = toResponse(currentUser, true);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("exportedAt", java.time.Instant.now().toString());
        out.put("profile", profile);
        out.put("stats", getStats(currentUser.getId()));
        return out;
    }

    // --- mapping ---

    private SkillDto toSkillDto(UserSkill s) {
        return SkillDto.builder().id(s.getId()).name(s.getSkillName()).level(s.getLevel()).build();
    }

    private UserProfileResponse toResponse(User u, boolean includeSkills) {
        List<SkillDto> skills = includeSkills ? listSkills(u.getId()) : null;
        List<String> interests = includeSkills ? userInterestRepository.findNamesByUserId(u.getId()) : null;
        return UserProfileResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .displayName(u.getDisplayName())
                .avatarUrl(u.getAvatarUrl())
                .bio(u.getBio())
                .githubUrl(u.getGithubUrl())
                .websiteUrl(u.getWebsiteUrl())
                .location(u.getLocation())
                .headline(u.getHeadline())
                .pronouns(u.getPronouns())
                .availableFor(u.getAvailableFor())
                .specialization(u.getSpecialization())
                .careerGoal(u.getCareerGoal())
                .interests(interests)
                .onboardingCompleted(u.isOnboardingCompleted())
                .reputationScore(u.getReputationScore())
                .role(u.getRole().name())
                .subscriptionTier(u.getSubscriptionTier() != null ? u.getSubscriptionTier().name() : "FREE")
                .createdAt(u.getCreatedAt())
                .skills(skills)
                .build();
    }

    @Transactional
    public UserProfileResponse completeOnboarding(User currentUser, OnboardingRequest req) {
        User u = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> AppException.notFound("User", currentUser.getId()));

        if (req.getSpecialization() != null) u.setSpecialization(req.getSpecialization().trim());
        if (req.getCareerGoal() != null)    u.setCareerGoal(req.getCareerGoal().trim());
        if (req.getAvailableFor() != null)  u.setAvailableFor(req.getAvailableFor().trim());
        u.setOnboardingCompleted(true);

        if (req.getInterests() != null) {
            userInterestRepository.deleteAllByUserId(u.getId());
            Set<String> seen = new HashSet<>();
            for (String raw : req.getInterests()) {
                if (raw == null) continue;
                String name = raw.trim();
                if (name.isEmpty() || name.length() > 60) continue;
                if (!seen.add(name.toLowerCase())) continue;
                userInterestRepository.save(UserInterest.builder()
                        .id(new UserInterestId(u.getId(), name))
                        .build());
            }
        }

        if (req.getTechnologies() != null) {
            Set<String> existing = new HashSet<>();
            for (var s : userSkillRepository.findByUserIdOrderByIdAsc(u.getId())) {
                existing.add(s.getSkillName().toLowerCase());
            }
            for (String raw : req.getTechnologies()) {
                if (raw == null) continue;
                String name = raw.trim();
                if (name.isEmpty() || name.length() > 100) continue;
                if (!existing.add(name.toLowerCase())) continue;
                userSkillRepository.save(UserSkill.builder()
                        .userId(u.getId())
                        .skillName(name)
                        .build());
            }
        }

        return toResponse(u, true);
    }
}
