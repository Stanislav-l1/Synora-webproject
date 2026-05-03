package com.synora.modules.post.repository;

import com.synora.modules.post.entity.PostHide;
import com.synora.modules.post.entity.PostHideId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PostHideRepository extends JpaRepository<PostHide, PostHideId> {

    @Query("SELECT h.id.postId FROM PostHide h WHERE h.id.userId = :userId")
    List<UUID> findPostIdsByUserId(@Param("userId") UUID userId);
}
