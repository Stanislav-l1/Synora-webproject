package com.synora.modules.project.service;

import com.synora.modules.notification.entity.NotificationType;
import com.synora.modules.notification.service.NotificationService;
import com.synora.modules.post.entity.Tag;
import com.synora.modules.post.repository.TagRepository;
import com.synora.modules.project.dto.*;
import com.synora.modules.project.entity.*;
import com.synora.modules.project.repository.*;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository       projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final TagRepository           tagRepository;
    private final NotificationService     notificationService;

    @Transactional(readOnly = true)
    public PageResponse<ProjectSummaryResponse> getProjects(int page, int size, Long tagId, String status) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        var result = tagId != null
                ? projectRepository.findPublicByTagId(tagId, pageable)
                : status != null
                ? projectRepository.findByIsPublicTrueAndStatus(ProjectStatus.valueOf(status), pageable)
                : projectRepository.findByIsPublicTrue(pageable);

        return PageResponse.from(result.map(this::toSummary));
    }

    @Cacheable(value = "projects", key = "#id")
    @Transactional(readOnly = true)
    public ProjectResponse getProject(UUID id, UUID currentUserId) {
        Project project = findOrThrow(id);
        return toFullResponse(project, currentUserId);
    }

    @Transactional
    public ProjectResponse createProject(User owner, CreateProjectRequest req) {
        Set<Tag> tags = resolveTags(req.getTagIds());
        Project project = Project.builder()
                .owner(owner)
                .name(req.getName())
                .description(req.getDescription())
                .coverUrl(req.getCoverUrl())
                .isPublic(req.isPublic())
                .repoUrl(req.getRepoUrl())
                .websiteUrl(req.getWebsiteUrl())
                .tags(tags)
                .build();
        Project saved = projectRepository.save(project);

        // Add owner as OWNER member
        memberRepository.save(ProjectMember.builder()
                .id(new ProjectMemberId(saved.getId(), owner.getId()))
                .project(saved)
                .user(owner)
                .role(MemberRole.OWNER)
                .build());

        return toFullResponse(saved, owner.getId());
    }

    @CacheEvict(value = "projects", key = "#id")
    @Transactional
    public ProjectResponse updateProject(UUID id, User currentUser, UpdateProjectRequest req) {
        Project project = findOrThrow(id);
        checkAdminOrOwner(project, currentUser);

        if (req.getName()        != null) project.setName(req.getName());
        if (req.getDescription() != null) project.setDescription(req.getDescription());
        if (req.getCoverUrl()    != null) project.setCoverUrl(req.getCoverUrl());
        if (req.getIsPublic()    != null) project.setPublic(req.getIsPublic());
        if (req.getStatus()      != null) project.setStatus(req.getStatus());
        if (req.getRepoUrl()     != null) project.setRepoUrl(req.getRepoUrl());
        if (req.getWebsiteUrl()  != null) project.setWebsiteUrl(req.getWebsiteUrl());
        if (req.getTagIds()      != null) project.setTags(resolveTags(req.getTagIds()));

        return toFullResponse(projectRepository.save(project), currentUser.getId());
    }

    @CacheEvict(value = "projects", key = "#id")
    @Transactional
    public void deleteProject(UUID id, User currentUser) {
        Project project = findOrThrow(id);
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw AppException.forbidden();
        }
        projectRepository.delete(project);
    }

    @Transactional
    public void joinProject(UUID id, User user) {
        Project project = findOrThrow(id);
        ProjectMemberId key = new ProjectMemberId(id, user.getId());
        if (memberRepository.existsById(key)) {
            throw AppException.conflict("Already a member of this project");
        }
        memberRepository.save(ProjectMember.builder()
                .id(key).project(Project.builder().id(id).build())
                .user(user).role(MemberRole.MEMBER).build());
        projectRepository.adjustMembers(id, 1);

        notificationService.send(
                project.getOwner().getId(), user, NotificationType.PROJECT_JOIN,
                id, "PROJECT",
                "{\"projectName\":\"" + escapeJson(project.getName()) + "\"}");
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    @Transactional
    public void leaveProject(UUID id, User user) {
        ProjectMemberId key = new ProjectMemberId(id, user.getId());
        ProjectMember member = memberRepository.findById(key)
                .orElseThrow(() -> AppException.badRequest("You are not a member of this project"));
        if (member.getRole() == MemberRole.OWNER) {
            throw AppException.badRequest("Owner cannot leave the project");
        }
        memberRepository.delete(member);
        projectRepository.adjustMembers(id, -1);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProjectSummaryResponse> getByOwner(String username, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                projectRepository.findByOwnerUsername(username, pageable).map(this::toSummary));
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> getMembers(UUID id) {
        return memberRepository.findByIdProjectId(id).stream()
                .map(m -> ProjectMemberResponse.builder()
                        .userId(m.getUser().getId())
                        .username(m.getUser().getUsername())
                        .displayName(m.getUser().getDisplayName())
                        .avatarUrl(m.getUser().getAvatarUrl())
                        .role(m.getRole().name())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .toList();
    }

    // --- helpers ---

    private Project findOrThrow(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Project", id));
    }

    private void checkAdminOrOwner(Project project, User user) {
        boolean isOwner = project.getOwner().getId().equals(user.getId());
        boolean isAdmin = memberRepository.existsByIdProjectIdAndIdUserIdAndRole(
                project.getId(), user.getId(), MemberRole.ADMIN);
        boolean isSiteAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isOwner && !isAdmin && !isSiteAdmin) {
            throw AppException.forbidden();
        }
    }

    private Set<Tag> resolveTags(List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) return new HashSet<>();
        return new HashSet<>(tagRepository.findAllById(tagIds));
    }

    private ProjectSummaryResponse toSummary(Project p) {
        return ProjectSummaryResponse.builder()
                .id(p.getId())
                .ownerUsername(p.getOwner().getUsername())
                .name(p.getName())
                .description(p.getDescription())
                .coverUrl(p.getCoverUrl())
                .status(p.getStatus().name())
                .membersCount(p.getMembersCount())
                .starsCount(p.getStarsCount())
                .tags(p.getTags().stream().map(t ->
                        com.synora.modules.post.dto.TagResponse.builder()
                                .id(t.getId()).name(t.getName()).color(t.getColor()).build()).toList())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private ProjectResponse toFullResponse(Project p, UUID currentUserId) {
        return ProjectResponse.builder()
                .id(p.getId())
                .ownerUsername(p.getOwner().getUsername())
                .ownerDisplayName(p.getOwner().getDisplayName())
                .ownerAvatarUrl(p.getOwner().getAvatarUrl())
                .name(p.getName())
                .description(p.getDescription())
                .coverUrl(p.getCoverUrl())
                .status(p.getStatus().name())
                .isPublic(p.isPublic())
                .repoUrl(p.getRepoUrl())
                .websiteUrl(p.getWebsiteUrl())
                .membersCount(p.getMembersCount())
                .starsCount(p.getStarsCount())
                .tags(p.getTags().stream().map(t ->
                        com.synora.modules.post.dto.TagResponse.builder()
                                .id(t.getId()).name(t.getName()).color(t.getColor()).build()).toList())
                .starred(currentUserId != null
                        ? memberRepository.existsByIdProjectIdAndIdUserId(p.getId(), currentUserId)
                        : null)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
