package com.synora.modules.user.service;

import com.synora.modules.user.dto.UpdateProfileRequest;
import com.synora.modules.user.dto.UserProfileResponse;
import com.synora.modules.user.entity.User;
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

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
