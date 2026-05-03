package com.synora.modules.admin.service;

import com.synora.modules.admin.dto.AdminStatsResponse;
import com.synora.modules.admin.dto.AdminUserResponse;
import com.synora.modules.community.repository.CommunityRepository;
import com.synora.modules.post.repository.PostRepository;
import com.synora.modules.project.repository.ProjectRepository;
import com.synora.modules.report.entity.ReportStatus;
import com.synora.modules.report.repository.ReportRepository;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.entity.UserRole;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository     userRepository;
    private final PostRepository     postRepository;
    private final ProjectRepository  projectRepository;
    private final CommunityRepository communityRepository;
    private final ReportRepository   reportRepository;

    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> listUsers(String q, UserRole role, Boolean banned,
                                                     int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                userRepository.adminSearch(
                        q != null && !q.isBlank() ? q.trim() : null,
                        role,
                        banned,
                        pageable
                ).map(this::toAdminResponse));
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUser(UUID id) {
        return toAdminResponse(userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User", id)));
    }

    @Transactional
    public AdminUserResponse banUser(UUID targetId, UUID adminId, String reason) {
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> AppException.notFound("User", targetId));
        if (target.getRole() == UserRole.ADMIN) {
            throw AppException.forbidden();
        }
        target.setBanned(true);
        target.setBanReason(reason);
        target.setBannedAt(Instant.now());
        target.setBannedById(adminId);
        return toAdminResponse(userRepository.save(target));
    }

    @Transactional
    public AdminUserResponse unbanUser(UUID targetId) {
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> AppException.notFound("User", targetId));
        target.setBanned(false);
        target.setBanReason(null);
        target.setBannedAt(null);
        target.setBannedById(null);
        return toAdminResponse(userRepository.save(target));
    }

    @Transactional
    public AdminUserResponse changeRole(UUID targetId, UUID adminId, UserRole newRole) {
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> AppException.notFound("User", targetId));
        if (targetId.equals(adminId)) {
            throw AppException.badRequest("Cannot change your own role");
        }
        target.setRole(newRole);
        return toAdminResponse(userRepository.save(target));
    }

    @Transactional
    public AdminUserResponse setActive(UUID targetId, boolean active) {
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> AppException.notFound("User", targetId));
        target.setActive(active);
        return toAdminResponse(userRepository.save(target));
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .bannedUsers(userRepository.countByBannedTrue())
                .newUsersLast7Days(userRepository.countByCreatedAtAfter(sevenDaysAgo))
                .totalPosts(postRepository.count())
                .totalProjects(projectRepository.count())
                .totalCommunities(communityRepository.count())
                .totalReports(reportRepository.count())
                .pendingReports(reportRepository.countByStatus(ReportStatus.PENDING))
                .build();
    }

    private AdminUserResponse toAdminResponse(User u) {
        return AdminUserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .displayName(u.getDisplayName())
                .avatarUrl(u.getAvatarUrl())
                .role(u.getRole().name())
                .active(u.isActive())
                .banned(u.isBanned())
                .banReason(u.getBanReason())
                .bannedAt(u.getBannedAt())
                .bannedById(u.getBannedById())
                .reputationScore(u.getReputationScore())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}
