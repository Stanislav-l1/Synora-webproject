package com.synora.modules.post.repository;

import com.synora.modules.post.entity.Post;
import com.synora.modules.post.entity.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {

    Page<Post> findByStatus(PostStatus status, Pageable pageable);

    Page<Post> findByAuthorUsernameAndStatus(String username, PostStatus status, Pageable pageable);

    @Query("""
            SELECT p FROM Post p JOIN p.tags t
            WHERE p.status = :status AND t.id = :tagId
            ORDER BY p.createdAt DESC
            """)
    Page<Post> findByStatusAndTagId(
            @Param("status") PostStatus status,
            @Param("tagId") Long tagId,
            Pageable pageable);

    @Modifying
    @Query("UPDATE Post p SET p.viewsCount = p.viewsCount + 1 WHERE p.id = :id")
    void incrementViews(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Post p SET p.likesCount = p.likesCount + :delta WHERE p.id = :id")
    void adjustLikes(@Param("id") UUID id, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Post p SET p.commentsCount = p.commentsCount + :delta WHERE p.id = :id")
    void adjustComments(@Param("id") UUID id, @Param("delta") int delta);
}
