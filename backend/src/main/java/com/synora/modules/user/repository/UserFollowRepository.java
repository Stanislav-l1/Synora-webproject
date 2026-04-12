package com.synora.modules.user.repository;

import com.synora.modules.user.entity.UserFollow;
import com.synora.modules.user.entity.UserFollowId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, UserFollowId> {

    Page<UserFollow> findByIdFollowerId(UUID followerId, Pageable pageable);

    Page<UserFollow> findByIdFollowingId(UUID followingId, Pageable pageable);

    long countByIdFollowerId(UUID followerId);

    long countByIdFollowingId(UUID followingId);
}
