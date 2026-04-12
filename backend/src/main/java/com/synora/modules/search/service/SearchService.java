package com.synora.modules.search.service;

import com.synora.modules.post.dto.PostSummaryResponse;
import com.synora.modules.post.dto.TagResponse;
import com.synora.modules.post.entity.Post;
import com.synora.modules.post.entity.PostStatus;
import com.synora.modules.project.dto.ProjectSummaryResponse;
import com.synora.modules.project.entity.Project;
import com.synora.modules.user.dto.UserProfileResponse;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.PageResponse;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final EntityManager em;

    @Transactional(readOnly = true)
    public PageResponse<PostSummaryResponse> searchPosts(String query, int page, int size) {
        String pattern = "%" + escapeLike(query.toLowerCase()) + "%";
        var pageable = PageRequest.of(page, size);

        // Step 1: paginated IDs only (no collection FETCH JOIN)
        String idJpql = "SELECT p.id FROM Post p " +
                "WHERE p.status = :status AND " +
                "(LOWER(p.title) LIKE :q OR LOWER(p.content) LIKE :q) " +
                "ORDER BY p.createdAt DESC";
        String countJpql = "SELECT COUNT(p) FROM Post p " +
                "WHERE p.status = :status AND " +
                "(LOWER(p.title) LIKE :q OR LOWER(p.content) LIKE :q)";

        long total = em.createQuery(countJpql, Long.class)
                .setParameter("status", PostStatus.PUBLISHED)
                .setParameter("q", pattern)
                .getSingleResult();

        List<UUID> ids = em.createQuery(idJpql, UUID.class)
                .setParameter("status", PostStatus.PUBLISHED)
                .setParameter("q", pattern)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        if (ids.isEmpty()) {
            return PageResponse.from(new PageImpl<>(List.of(), pageable, total));
        }

        // Step 2: fetch full entities with JOIN FETCH by IDs
        String fetchJpql = "SELECT DISTINCT p FROM Post p " +
                "LEFT JOIN FETCH p.tags LEFT JOIN FETCH p.author " +
                "WHERE p.id IN :ids ORDER BY p.createdAt DESC";

        List<Post> posts = em.createQuery(fetchJpql, Post.class)
                .setParameter("ids", ids)
                .getResultList();

        Page<PostSummaryResponse> result = new PageImpl<>(
                posts.stream().map(this::toPostSummary).toList(), pageable, total);
        return PageResponse.from(result);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProjectSummaryResponse> searchProjects(String query, int page, int size) {
        String pattern = "%" + escapeLike(query.toLowerCase()) + "%";
        var pageable = PageRequest.of(page, size);

        String jpql = "SELECT p FROM Project p LEFT JOIN FETCH p.owner " +
                "WHERE p.isPublic = true AND " +
                "(LOWER(p.name) LIKE :q OR LOWER(p.description) LIKE :q) " +
                "ORDER BY p.createdAt DESC";
        String countJpql = "SELECT COUNT(p) FROM Project p " +
                "WHERE p.isPublic = true AND " +
                "(LOWER(p.name) LIKE :q OR LOWER(p.description) LIKE :q)";

        long total = em.createQuery(countJpql, Long.class)
                .setParameter("q", pattern)
                .getSingleResult();

        List<Project> projects = em.createQuery(jpql, Project.class)
                .setParameter("q", pattern)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        Page<ProjectSummaryResponse> result = new PageImpl<>(
                projects.stream().map(this::toProjectSummary).toList(), pageable, total);
        return PageResponse.from(result);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserProfileResponse> searchUsers(String query, int page, int size) {
        String pattern = "%" + escapeLike(query.toLowerCase()) + "%";
        var pageable = PageRequest.of(page, size);

        String jpql = "SELECT u FROM User u " +
                "WHERE u.active = true AND " +
                "(LOWER(u.username) LIKE :q OR LOWER(u.displayName) LIKE :q) " +
                "ORDER BY u.reputationScore DESC";
        String countJpql = "SELECT COUNT(u) FROM User u " +
                "WHERE u.active = true AND " +
                "(LOWER(u.username) LIKE :q OR LOWER(u.displayName) LIKE :q)";

        long total = em.createQuery(countJpql, Long.class)
                .setParameter("q", pattern)
                .getSingleResult();

        List<User> users = em.createQuery(jpql, User.class)
                .setParameter("q", pattern)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        Page<UserProfileResponse> result = new PageImpl<>(
                users.stream().map(this::toUserProfile).toList(), pageable, total);
        return PageResponse.from(result);
    }

    private String escapeLike(String input) {
        return input
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }

    private PostSummaryResponse toPostSummary(Post p) {
        return PostSummaryResponse.builder()
                .id(p.getId())
                .authorUsername(p.getAuthor().getUsername())
                .authorDisplayName(p.getAuthor().getDisplayName())
                .authorAvatarUrl(p.getAuthor().getAvatarUrl())
                .title(p.getTitle())
                .preview(p.getPreview())
                .coverUrl(p.getCoverUrl())
                .status(p.getStatus().name())
                .viewsCount(p.getViewsCount())
                .likesCount(p.getLikesCount())
                .commentsCount(p.getCommentsCount())
                .tags(p.getTags().stream().map(t -> TagResponse.builder()
                        .id(t.getId()).name(t.getName()).color(t.getColor()).build()).toList())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private ProjectSummaryResponse toProjectSummary(Project p) {
        return ProjectSummaryResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .ownerUsername(p.getOwner().getUsername())
                .coverUrl(p.getCoverUrl())
                .status(p.getStatus().name())
                .membersCount(p.getMembersCount())
                .starsCount(p.getStarsCount())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private UserProfileResponse toUserProfile(User u) {
        return UserProfileResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .displayName(u.getDisplayName())
                .avatarUrl(u.getAvatarUrl())
                .bio(u.getBio())
                .reputationScore(u.getReputationScore())
                .role(u.getRole().name())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
