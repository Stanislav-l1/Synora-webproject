package com.synora.modules.post.repository;

import com.synora.modules.post.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {

    Page<Comment> findByPostIdAndParentIsNullAndDeletedFalse(UUID postId, Pageable pageable);

    Page<Comment> findByParentIdAndDeletedFalse(UUID parentId, Pageable pageable);
}
