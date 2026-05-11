package com.synora.modules.post.service;

import com.synora.modules.notification.entity.NotificationType;
import com.synora.modules.notification.service.NotificationService;
import com.synora.modules.post.dto.*;
import com.synora.modules.post.entity.*;
import com.synora.modules.post.repository.*;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import io.micrometer.core.instrument.Counter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository         postRepository;
    private final TagRepository          tagRepository;
    private final PostLikeRepository     likeRepository;
    private final PostBookmarkRepository bookmarkRepository;
    private final PostReactionRepository reactionRepository;
    private final PostHideRepository     hideRepository;
    private final NotificationService    notificationService;
    private final Counter                postsCreated;

    @Transactional(readOnly = true)
    public PageResponse<PostSummaryResponse> getFeed(int page, int size, Long tagId, UUID currentUserId) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<UUID> hidden = currentUserId != null
                ? hideRepository.findPostIdsByUserId(currentUserId)
                : List.of();

        Page<Post> posts;
        if (tagId != null) {
            posts = hidden.isEmpty()
                    ? postRepository.findByStatusAndTagId(PostStatus.PUBLISHED, tagId, pageable)
                    : postRepository.findByStatusAndTagIdExcludingIds(PostStatus.PUBLISHED, tagId, hidden, pageable);
        } else {
            posts = hidden.isEmpty()
                    ? postRepository.findByStatus(PostStatus.PUBLISHED, pageable)
                    : postRepository.findByStatusExcludingIds(PostStatus.PUBLISHED, hidden, pageable);
        }
        return PageResponse.from(posts.map(p -> toSummary(p, currentUserId)));
    }

    @Transactional(readOnly = true)
    public PageResponse<PostSummaryResponse> getSaved(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var bookmarks = bookmarkRepository.findByUserId(userId, pageable);
        List<UUID> ids = bookmarks.map(b -> b.getId().getPostId()).getContent();
        if (ids.isEmpty()) return PageResponse.from(Page.empty(pageable));
        Page<Post> posts = postRepository.findByIdInAndStatus(ids, PostStatus.PUBLISHED, pageable);
        return PageResponse.from(posts.map(p -> toSummary(p, userId)));
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
        postsCreated.increment();
        return toFullResponse(saved, author.getId());
    }

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

    @Transactional
    public void deletePost(UUID id, User currentUser) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Post", id));
        checkOwnerOrAdmin(post, currentUser);
        if (post.getRepostOf() != null) {
            postRepository.adjustReposts(post.getRepostOf().getId(), -1);
        }
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
            if (!post.getAuthor().getId().equals(actor.getId())) {
                notificationService.send(
                        post.getAuthor().getId(), actor, NotificationType.POST_LIKE,
                        postId, "POST",
                        "{\"title\":\"" + escapeJson(post.getTitle()) + "\"}");
            }
            return true;
        }
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

    @Transactional
    public ReactionType setReaction(UUID postId, User actor, ReactionType type) {
        findPublishedOrThrow(postId);
        PostReactionId key = new PostReactionId(postId, actor.getId());
        PostReaction existing = reactionRepository.findById(key).orElse(null);
        if (existing != null) {
            existing.setType(type);
            reactionRepository.save(existing);
        } else {
            reactionRepository.save(PostReaction.builder().id(key).type(type).build());
        }
        return type;
    }

    @Transactional
    public void clearReaction(UUID postId, User actor) {
        PostReactionId key = new PostReactionId(postId, actor.getId());
        if (reactionRepository.existsById(key)) {
            reactionRepository.deleteById(key);
        }
    }

    @Transactional
    public boolean toggleHide(UUID postId, UUID userId) {
        findPublishedOrThrow(postId);
        PostHideId key = new PostHideId(postId, userId);
        if (hideRepository.existsById(key)) {
            hideRepository.deleteById(key);
            return false;
        } else {
            hideRepository.save(PostHide.builder().id(key).build());
            return true;
        }
    }

    @Transactional
    public PostResponse repost(UUID postId, User actor) {
        Post original = findPublishedOrThrow(postId);
        if (original.getAuthor().getId().equals(actor.getId())) {
            throw AppException.badRequest("Cannot repost your own post");
        }
        Post rootTarget = original.getRepostOf() != null ? original.getRepostOf() : original;
        if (postRepository.existsByAuthorIdAndRepostOfId(actor.getId(), rootTarget.getId())) {
            throw AppException.conflict("Already reposted");
        }
        Post repost = Post.builder()
                .author(actor)
                .title(rootTarget.getTitle())
                .content(rootTarget.getContent())
                .preview(rootTarget.getPreview())
                .coverUrl(rootTarget.getCoverUrl())
                .status(PostStatus.PUBLISHED)
                .repostOf(rootTarget)
                .build();
        Post saved = postRepository.save(repost);
        postRepository.adjustReposts(rootTarget.getId(), 1);
        if (!rootTarget.getAuthor().getId().equals(actor.getId())) {
            notificationService.send(
                    rootTarget.getAuthor().getId(), actor, NotificationType.POST_LIKE,
                    rootTarget.getId(), "POST",
                    "{\"title\":\"" + escapeJson(rootTarget.getTitle()) + "\",\"repost\":true}");
        }
        return toFullResponse(saved, actor.getId());
    }

    @Transactional
    public boolean togglePin(UUID postId, User currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> AppException.notFound("Post", postId));
        checkOwnerOrAdmin(post, currentUser);
        post.setPinned(!post.isPinned());
        postRepository.save(post);
        return post.isPinned();
    }

    @Transactional(readOnly = true)
    public PageResponse<PostSummaryResponse> getByCommunity(UUID communityId, int page, int size, UUID currentUserId) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                postRepository.findByCommunityIdAndStatus(communityId, PostStatus.PUBLISHED, pageable)
                        .map(p -> toSummary(p, currentUserId)));
    }

    @Transactional(readOnly = true)
    public PageResponse<PostSummaryResponse> getByAuthor(String username, int page, int size, UUID currentUserId) {
        var pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "pinned").and(Sort.by(Sort.Direction.DESC, "createdAt")));
        return PageResponse.from(
                postRepository.findByAuthorUsernameAndStatus(username, PostStatus.PUBLISHED, pageable)
                        .map(p -> toSummary(p, currentUserId)));
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

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private Map<String, Long> reactionCounts(UUID postId) {
        Map<String, Long> out = new LinkedHashMap<>();
        reactionRepository.countByPost(postId)
                .forEach(r -> out.put(r.getType().name(), r.getCount()));
        return out;
    }

    private String myReaction(UUID postId, UUID userId) {
        if (userId == null) return null;
        return reactionRepository.findById(new PostReactionId(postId, userId))
                .map(r -> r.getType().name())
                .orElse(null);
    }

    private boolean hasReposted(UUID postId, UUID userId) {
        if (userId == null) return false;
        return postRepository.existsByAuthorIdAndRepostOfId(userId, postId);
    }

    private PostSummaryResponse toSummary(Post p, UUID currentUserId) {
        PostSummaryResponse repostOfSummary = null;
        if (p.getRepostOf() != null) {
            Post ro = p.getRepostOf();
            repostOfSummary = PostSummaryResponse.builder()
                    .id(ro.getId())
                    .authorUsername(ro.getAuthor().getUsername())
                    .authorDisplayName(ro.getAuthor().getDisplayName())
                    .authorAvatarUrl(ro.getAuthor().getAvatarUrl())
                    .authorVerified(ro.getAuthor().isVerified())
                    .authorVerificationType(ro.getAuthor().getVerificationType() != null ? ro.getAuthor().getVerificationType().name() : null)
                    .title(ro.getTitle())
                    .preview(ro.getPreview())
                    .coverUrl(ro.getCoverUrl())
                    .status(ro.getStatus().name())
                    .viewsCount(ro.getViewsCount())
                    .likesCount(ro.getLikesCount())
                    .commentsCount(ro.getCommentsCount())
                    .repostsCount(ro.getRepostsCount())
                    .tags(ro.getTags().stream().map(t -> TagResponse.builder()
                            .id(t.getId()).name(t.getName()).color(t.getColor()).build()).toList())
                    .createdAt(ro.getCreatedAt())
                    .build();
        }

        Boolean liked = currentUserId != null
                ? likeRepository.existsById(new PostLikeId(p.getId(), currentUserId))
                : null;
        Boolean bookmarked = currentUserId != null
                ? bookmarkRepository.existsById(new PostBookmarkId(p.getId(), currentUserId))
                : null;

        return PostSummaryResponse.builder()
                .id(p.getId())
                .authorUsername(p.getAuthor().getUsername())
                .authorDisplayName(p.getAuthor().getDisplayName())
                .authorAvatarUrl(p.getAuthor().getAvatarUrl())
                .authorVerified(p.getAuthor().isVerified())
                .authorVerificationType(p.getAuthor().getVerificationType() != null ? p.getAuthor().getVerificationType().name() : null)
                .title(p.getTitle())
                .preview(p.getPreview())
                .coverUrl(p.getCoverUrl())
                .status(p.getStatus().name())
                .viewsCount(p.getViewsCount())
                .likesCount(p.getLikesCount())
                .commentsCount(p.getCommentsCount())
                .repostsCount(p.getRepostsCount())
                .pinned(p.isPinned())
                .tags(p.getTags().stream().map(t -> TagResponse.builder()
                        .id(t.getId()).name(t.getName()).color(t.getColor()).build()).toList())
                .liked(liked)
                .bookmarked(bookmarked)
                .reposted(currentUserId != null ? hasReposted(p.getId(), currentUserId) : null)
                .myReaction(myReaction(p.getId(), currentUserId))
                .reactions(reactionCounts(p.getId()))
                .communityId(p.getCommunityId())
                .repostOf(repostOfSummary)
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

        PostSummaryResponse repostOfSummary = null;
        if (p.getRepostOf() != null) {
            Post ro = p.getRepostOf();
            repostOfSummary = PostSummaryResponse.builder()
                    .id(ro.getId())
                    .authorUsername(ro.getAuthor().getUsername())
                    .authorDisplayName(ro.getAuthor().getDisplayName())
                    .authorAvatarUrl(ro.getAuthor().getAvatarUrl())
                    .authorVerified(ro.getAuthor().isVerified())
                    .authorVerificationType(ro.getAuthor().getVerificationType() != null ? ro.getAuthor().getVerificationType().name() : null)
                    .title(ro.getTitle())
                    .preview(ro.getPreview())
                    .coverUrl(ro.getCoverUrl())
                    .status(ro.getStatus().name())
                    .viewsCount(ro.getViewsCount())
                    .likesCount(ro.getLikesCount())
                    .commentsCount(ro.getCommentsCount())
                    .repostsCount(ro.getRepostsCount())
                    .createdAt(ro.getCreatedAt())
                    .build();
        }

        return PostResponse.builder()
                .id(p.getId())
                .authorUsername(p.getAuthor().getUsername())
                .authorDisplayName(p.getAuthor().getDisplayName())
                .authorAvatarUrl(p.getAuthor().getAvatarUrl())
                .authorVerified(p.getAuthor().isVerified())
                .authorVerificationType(p.getAuthor().getVerificationType() != null ? p.getAuthor().getVerificationType().name() : null)
                .title(p.getTitle())
                .content(p.getContent())
                .preview(p.getPreview())
                .coverUrl(p.getCoverUrl())
                .status(p.getStatus().name())
                .viewsCount(p.getViewsCount())
                .likesCount(p.getLikesCount())
                .commentsCount(p.getCommentsCount())
                .repostsCount(p.getRepostsCount())
                .pinned(p.isPinned())
                .tags(p.getTags().stream().map(t -> TagResponse.builder()
                        .id(t.getId()).name(t.getName()).color(t.getColor()).build()).toList())
                .liked(liked)
                .bookmarked(bookmarked)
                .reposted(currentUserId != null ? hasReposted(p.getId(), currentUserId) : null)
                .myReaction(myReaction(p.getId(), currentUserId))
                .reactions(reactionCounts(p.getId()))
                .communityId(p.getCommunityId())
                .repostOf(repostOfSummary)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
