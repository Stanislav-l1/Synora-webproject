package com.synora.modules.post.service;

import com.synora.modules.notification.entity.NotificationType;
import com.synora.modules.notification.service.NotificationService;
import com.synora.modules.post.dto.*;
import com.synora.modules.post.entity.*;
import com.synora.modules.post.repository.*;
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
public class PostService {

    private final PostRepository     postRepository;
    private final TagRepository      tagRepository;
    private final PostLikeRepository likeRepository;
    private final PostBookmarkRepository bookmarkRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public PageResponse<PostSummaryResponse> getFeed(int page, int size, Long tagId) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var posts = tagId != null
                ? postRepository.findByStatusAndTagId(PostStatus.PUBLISHED, tagId, pageable)
                : postRepository.findByStatus(PostStatus.PUBLISHED, pageable);
        return PageResponse.from(posts.map(this::toSummary));
    }

    @Transactional
    public PostResponse getPost(UUID id, UUID currentUserId) {
        Post post = findPublishedOrThrow(id);
        postRepository.incrementViews(id);
        return toFullResponse(post, currentUserId);
    }

    @Transactional
    public PostResponse createPost(User author, CreatePostRequest req) {
        Set<Tag> tags = resolveTags(req.getTagIds());
        Post post = Post.builder()
                .author(author)
                .title(req.getTitle())
                .content(req.getContent())
                .preview(req.getPreview())
                .coverUrl(req.getCoverUrl())
                .status(req.getStatus() != null ? req.getStatus() : PostStatus.PUBLISHED)
                .tags(tags)
                .build();
        Post saved = postRepository.save(post);
        incrementTagUsage(tags);
        return toFullResponse(saved, author.getId());
    }

    @CacheEvict(value = "posts", key = "#id")
    @Transactional
    public PostResponse updatePost(UUID id, User currentUser, UpdatePostRequest req) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Post", id));
        checkOwnerOrAdmin(post, currentUser);

        if (req.getTitle()    != null) post.setTitle(req.getTitle());
        if (req.getContent()  != null) post.setContent(req.getContent());
        if (req.getPreview()  != null) post.setPreview(req.getPreview());
        if (req.getCoverUrl() != null) post.setCoverUrl(req.getCoverUrl());
        if (req.getStatus()   != null) post.setStatus(req.getStatus());
        if (req.getTagIds()   != null) post.setTags(resolveTags(req.getTagIds()));

        return toFullResponse(postRepository.save(post), currentUser.getId());
    }

    @CacheEvict(value = "posts", key = "#id")
    @Transactional
    public void deletePost(UUID id, User currentUser) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Post", id));
        checkOwnerOrAdmin(post, currentUser);
        postRepository.delete(post);
    }

    @Transactional
    public boolean toggleLike(UUID postId, User actor) {
        Post post = findPublishedOrThrow(postId);
        PostLikeId key = new PostLikeId(postId, actor.getId());
        if (likeRepository.existsById(key)) {
            likeRepository.deleteById(key);
            postRepository.adjustLikes(postId, -1);
            return false;
        } else {
            likeRepository.save(new PostLike(key, null));
            postRepository.adjustLikes(postId, 1);
            notificationService.send(
                    post.getAuthor().getId(), actor, NotificationType.POST_LIKE,
                    postId, "POST",
                    "{\"title\":\"" + escapeJson(post.getTitle()) + "\"}");
            return true;
        }
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    @Transactional
    public boolean toggleBookmark(UUID postId, UUID userId) {
        findPublishedOrThrow(postId);
        PostBookmarkId key = new PostBookmarkId(postId, userId);
        if (bookmarkRepository.existsById(key)) {
            bookmarkRepository.deleteById(key);
            return false;
        } else {
            bookmarkRepository.save(new PostBookmark(key, null));
            return true;
        }
    }

    @Cacheable(value = "posts", key = "#username + '_' + #page + '_' + #size")
    @Transactional(readOnly = true)
    public PageResponse<PostSummaryResponse> getByAuthor(String username, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                postRepository.findByAuthorUsernameAndStatus(username, PostStatus.PUBLISHED, pageable)
                        .map(this::toSummary));
    }

    // --- helpers ---

    private Post findPublishedOrThrow(UUID id) {
        return postRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Post", id));
    }

    private void checkOwnerOrAdmin(Post post, User user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!post.getAuthor().getId().equals(user.getId()) && !isAdmin) {
            throw AppException.forbidden();
        }
    }

    private Set<Tag> resolveTags(List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) return new HashSet<>();
        return new HashSet<>(tagRepository.findAllById(tagIds));
    }

    private void incrementTagUsage(Set<Tag> tags) {
        tags.forEach(t -> {
            t.setUsageCount(t.getUsageCount() + 1);
            tagRepository.save(t);
        });
    }

    private PostSummaryResponse toSummary(Post p) {
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

    private PostResponse toFullResponse(Post p, UUID currentUserId) {
        Boolean liked = currentUserId != null
                ? likeRepository.existsById(new PostLikeId(p.getId(), currentUserId))
                : null;
        Boolean bookmarked = currentUserId != null
                ? bookmarkRepository.existsById(new PostBookmarkId(p.getId(), currentUserId))
                : null;

        return PostResponse.builder()
                .id(p.getId())
                .authorUsername(p.getAuthor().getUsername())
                .authorDisplayName(p.getAuthor().getDisplayName())
                .authorAvatarUrl(p.getAuthor().getAvatarUrl())
                .title(p.getTitle())
                .content(p.getContent())
                .preview(p.getPreview())
                .coverUrl(p.getCoverUrl())
                .status(p.getStatus().name())
                .viewsCount(p.getViewsCount())
                .likesCount(p.getLikesCount())
                .commentsCount(p.getCommentsCount())
                .pinned(p.isPinned())
                .tags(p.getTags().stream().map(t -> TagResponse.builder()
                        .id(t.getId()).name(t.getName()).color(t.getColor()).build()).toList())
                .liked(liked)
                .bookmarked(bookmarked)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
