package com.synora.modules.post.repository;

import com.synora.modules.post.entity.PostReaction;
import com.synora.modules.post.entity.PostReactionId;
import com.synora.modules.post.entity.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PostReactionRepository extends JpaRepository<PostReaction, PostReactionId> {

    @Query("""
            SELECT r.type AS type, COUNT(r) AS count
            FROM PostReaction r
            WHERE r.id.postId = :postId
            GROUP BY r.type
            """)
    List<ReactionCount> countByPost(@Param("postId") UUID postId);

    @Query("""
            SELECT r.id.postId AS postId, r.type AS type, COUNT(r) AS count
            FROM PostReaction r
            WHERE r.id.postId IN :postIds
            GROUP BY r.id.postId, r.type
            """)
    List<PostReactionCount> countByPosts(@Param("postIds") List<UUID> postIds);

    interface ReactionCount {
        ReactionType getType();
        Long getCount();
    }

    interface PostReactionCount {
        UUID getPostId();
        ReactionType getType();
        Long getCount();
    }
}
