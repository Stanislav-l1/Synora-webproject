package com.synora.modules.post.repository;

import com.synora.modules.post.entity.Post;
import com.synora.modules.post.entity.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
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

    @Query("""
            SELECT p FROM Post p
            WHERE p.status = :status AND p.id NOT IN :hiddenIds
            """)
    Page<Post> findByStatusExcludingIds(
            @Param("status") PostStatus status,
            @Param("hiddenIds") Collection<UUID> hiddenIds,
            Pageable pageable);

    @Query("""
            SELECT p FROM Post p JOIN p.tags t
            WHERE p.status = :status AND t.id = :tagId AND p.id NOT IN :hiddenIds
            ORDER BY p.createdAt DESC
            """)
    Page<Post> findByStatusAndTagIdExcludingIds(
            @Param("status") PostStatus status,
            @Param("tagId") Long tagId,
            @Param("hiddenIds") Collection<UUID> hiddenIds,
            Pageable pageable);

    @Query("""
            SELECT p FROM Post p
            WHERE p.id IN :ids AND p.status = :status
            """)
    Page<Post> findByIdInAndStatus(
            @Param("ids") Collection<UUID> ids,
            @Param("status") PostStatus status,
            Pageable pageable);

    Page<Post> findByCommunityIdAndStatus(UUID communityId, PostStatus status, Pageable pageable);

    boolean existsByAuthorIdAndRepostOfId(UUID authorId, UUID repostOfId);

    @Modifying
    @Query("UPDATE Post p SET p.viewsCount = p.viewsCount + 1 WHERE p.id = :id")
    void incrementViews(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Post p SET p.likesCount = p.likesCount + :delta WHERE p.id = :id")
    void adjustLikes(@Param("id") UUID id, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Post p SET p.commentsCount = p.commentsCount + :delta WHERE p.id = :id")
    void adjustComments(@Param("id") UUID id, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Post p SET p.repostsCount = p.repostsCount + :delta WHERE p.id = :id")
    void adjustReposts(@Param("id") UUID id, @Param("delta") int delta);

    Page<Post> findByAuthorIdAndStatus(UUID authorId, PostStatus status, Pageable pageable);

    long countByAuthorId(UUID authorId);

    long countByAuthorIdAndCreatedAtAfter(UUID authorId, Instant since);

    @Query("""
            SELECT DISTINCT p FROM Post p JOIN p.tags t
            WHERE p.status = :status AND t.id IN :tagIds AND p.author.id <> :excludeUserId
            ORDER BY p.createdAt DESC
            """)
    Page<Post> findByStatusAndTagIdsExcludingAuthor(
            @Param("status") PostStatus status,
            @Param("tagIds") Collection<Long> tagIds,
            @Param("excludeUserId") UUID excludeUserId,
            Pageable pageable);

    @Query("SELECT COUNT(p) FROM Post p JOIN p.tags t " +
           "WHERE p.status = :status AND t.id = :tagId")
    long countByStatusAndTagId(@Param("status") PostStatus status,
                               @Param("tagId") Long tagId);

    @Query("SELECT COUNT(p) FROM Post p JOIN p.tags t " +
           "WHERE p.status = :status AND t.id = :tagId AND p.createdAt > :since")
    long countByStatusAndTagIdSince(@Param("status") PostStatus status,
                                    @Param("tagId") Long tagId,
                                    @Param("since") Instant since);

    @Query("""
            SELECT p FROM Post p JOIN p.tags t
            WHERE p.status = :status AND t.id = :tagId AND p.commentsCount > 0
            ORDER BY p.commentsCount DESC, p.createdAt DESC
            """)
    Page<Post> findMostDiscussedByStatusAndTagId(
            @Param("status") PostStatus status,
            @Param("tagId") Long tagId,
            Pageable pageable);
}
