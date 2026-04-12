package com.synora.modules.post.service;

import com.synora.modules.post.dto.CommentResponse;
import com.synora.modules.post.dto.CreateCommentRequest;
import com.synora.modules.post.entity.Comment;
import com.synora.modules.post.entity.Post;
import com.synora.modules.post.repository.CommentRepository;
import com.synora.modules.post.repository.PostRepository;
import com.synora.modules.user.entity.User;
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
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository    postRepository;

    @Transactional(readOnly = true)
    public PageResponse<CommentResponse> getComments(UUID postId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        return PageResponse.from(
                commentRepository.findByPostIdAndParentIsNullAndDeletedFalse(postId, pageable)
                        .map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<CommentResponse> getReplies(UUID parentId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        return PageResponse.from(
                commentRepository.findByParentIdAndDeletedFalse(parentId, pageable)
                        .map(this::toResponse));
    }

    @Transactional
    public CommentResponse createComment(UUID postId, User author, CreateCommentRequest req) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> AppException.notFound("Post", postId));

        Comment parent = null;
        if (req.getParentId() != null) {
            parent = commentRepository.findById(req.getParentId())
                    .orElseThrow(() -> AppException.notFound("Comment", req.getParentId()));
        }

        Comment comment = Comment.builder()
                .post(post)
                .author(author)
                .parent(parent)
                .content(req.getContent())
                .build();

        Comment saved = commentRepository.save(comment);
        postRepository.adjustComments(postId, 1);
        return toResponse(saved);
    }

    @Transactional
    public void deleteComment(UUID id, User currentUser) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Comment", id));

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!comment.getAuthor().getId().equals(currentUser.getId()) && !isAdmin) {
            throw AppException.forbidden();
        }

        comment.setDeleted(true);
        comment.setContent("[deleted]");
        commentRepository.save(comment);
        postRepository.adjustComments(comment.getPost().getId(), -1);
    }

    private CommentResponse toResponse(Comment c) {
        return CommentResponse.builder()
                .id(c.getId())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .authorUsername(c.getAuthor().getUsername())
                .authorDisplayName(c.getAuthor().getDisplayName())
                .authorAvatarUrl(c.getAuthor().getAvatarUrl())
                .content(c.isDeleted() ? "[deleted]" : c.getContent())
                .likesCount(c.getLikesCount())
                .deleted(c.isDeleted())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
