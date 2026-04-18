package com.synora.modules.user.service;

import com.synora.modules.post.repository.PostRepository;
import com.synora.modules.project.repository.ProjectRepository;
import com.synora.modules.user.dto.UpdateProfileRequest;
import com.synora.modules.user.dto.UserProfileResponse;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserFollowRepository;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ProjectRepository projectRepository;
    private final UserFollowRepository userFollowRepository;

    @Cacheable(value = "users", key = "#username")
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> AppException.notFound("User", username));
        return toResponse(user);
    }

    @Cacheable(value = "users", key = "#id")
    @Transactional(readOnly = true)
    public UserProfileResponse getProfileById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User", id));
        return toResponse(user);
    }

    @CacheEvict(value = "users", allEntries = true)
    @Transactional
    public UserProfileResponse updateProfile(User currentUser, UpdateProfileRequest req) {
        if (req.getDisplayName() != null) currentUser.setDisplayName(req.getDisplayName());
        if (req.getBio()         != null) currentUser.setBio(req.getBio());
        if (req.getGithubUrl()   != null) currentUser.setGithubUrl(req.getGithubUrl());
        if (req.getWebsiteUrl()  != null) currentUser.setWebsiteUrl(req.getWebsiteUrl());
        if (req.getLocation()    != null) currentUser.setLocation(req.getLocation());

        return toResponse(userRepository.save(currentUser));
    }

    @Transactional(readOnly = true)
    public PageResponse<UserProfileResponse> getTopByReputation(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reputationScore"));
        return PageResponse.from(userRepository.findAll(pageable).map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getSuggested(UUID excludeUserId, int limit) {
        var pageable = PageRequest.of(0, limit + 1,
                Sort.by(Sort.Direction.DESC, "reputationScore"));
        return userRepository.findAll(pageable).stream()
                .filter(u -> excludeUserId == null || !u.getId().equals(excludeUserId))
                .limit(limit)
                .map(this::toResponse)
                .toList();
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

    // --- mapping ---

    private UserProfileResponse toResponse(User u) {
        return UserProfileResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .displayName(u.getDisplayName())
                .avatarUrl(u.getAvatarUrl())
                .bio(u.getBio())
                .githubUrl(u.getGithubUrl())
                .websiteUrl(u.getWebsiteUrl())
                .location(u.getLocation())
                .reputationScore(u.getReputationScore())
                .role(u.getRole().name())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
