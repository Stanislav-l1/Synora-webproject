package com.synora.modules.user.repository;

import com.synora.modules.user.entity.UserFollow;
import com.synora.modules.user.entity.UserFollowId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, UserFollowId> {

    Page<UserFollow> findByIdFollowerId(UUID followerId, Pageable pageable);

    Page<UserFollow> findByIdFollowingId(UUID followingId, Pageable pageable);

    long countByIdFollowerId(UUID followerId);

    long countByIdFollowingId(UUID followingId);

    @Query("""
           SELECT f.id.followingId FROM UserFollow f WHERE f.id.followerId = :userId
           """)
    List<UUID> findFollowingIds(@Param("userId") UUID userId);

    long countByIdFollowingIdAndCreatedAtAfter(UUID followingId, java.time.Instant after);

    @Query(value = """
           SELECT f2.following_id
           FROM user_follows f1
           JOIN user_follows f2 ON f2.follower_id = f1.following_id
           WHERE f1.follower_id = :userId
             AND f2.following_id <> :userId
             AND f2.following_id NOT IN (
                 SELECT following_id FROM user_follows WHERE follower_id = :userId
             )
           GROUP BY f2.following_id
           ORDER BY COUNT(*) DESC
           LIMIT :limit
           """, nativeQuery = true)
    List<UUID> findFriendsOfFriends(@Param("userId") UUID userId, @Param("limit") int limit);
}
