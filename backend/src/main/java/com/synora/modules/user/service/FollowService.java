package com.synora.modules.user.service;

import com.synora.modules.notification.entity.NotificationType;
import com.synora.modules.notification.service.NotificationService;
import com.synora.modules.user.dto.FollowResponse;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.entity.UserFollow;
import com.synora.modules.user.entity.UserFollowId;
import com.synora.modules.user.repository.UserFollowRepository;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final UserFollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public boolean toggleFollow(User follower, UUID targetUserId) {
        if (follower.getId().equals(targetUserId)) {
            throw AppException.badRequest("Cannot follow yourself");
        }

        UserFollowId key = new UserFollowId(follower.getId(), targetUserId);

        if (followRepository.existsById(key)) {
            followRepository.deleteById(key);
            return false;
        } else {
            User target = userRepository.findById(targetUserId)
                    .orElseThrow(() -> AppException.notFound("User", targetUserId));
            UserFollow follow = UserFollow.builder()
                    .id(key)
                    .follower(follower)
                    .following(target)
                    .build();
            followRepository.save(follow);

            notificationService.send(
                    targetUserId, follower, NotificationType.FOLLOW,
                    follower.getId(), "USER", null);

            return true;
        }
    }

    @Transactional(readOnly = true)
    public boolean isFollowing(UUID followerId, UUID followingId) {
        return followRepository.existsById(new UserFollowId(followerId, followingId));
    }

    @Transactional(readOnly = true)
    public PageResponse<FollowResponse> getFollowers(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                followRepository.findByIdFollowingId(userId, pageable)
                        .map(f -> toResponse(f.getFollower(), f.getCreatedAt())));
    }

    @Transactional(readOnly = true)
    public PageResponse<FollowResponse> getFollowing(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                followRepository.findByIdFollowerId(userId, pageable)
                        .map(f -> toResponse(f.getFollowing(), f.getCreatedAt())));
    }

    @Transactional(readOnly = true)
    public long getFollowersCount(UUID userId) {
        return followRepository.countByIdFollowingId(userId);
    }

    @Transactional(readOnly = true)
    public long getFollowingCount(UUID userId) {
        return followRepository.countByIdFollowerId(userId);
    }

    private FollowResponse toResponse(User user, java.time.Instant followedAt) {
        return FollowResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .followedAt(followedAt)
                .build();
    }
}
