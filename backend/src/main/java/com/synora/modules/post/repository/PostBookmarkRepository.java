package com.synora.modules.post.repository;

import com.synora.modules.post.entity.PostBookmark;
import com.synora.modules.post.entity.PostBookmarkId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface PostBookmarkRepository extends JpaRepository<PostBookmark, PostBookmarkId> {

    @Query("SELECT b FROM PostBookmark b WHERE b.id.userId = :userId")
    Page<PostBookmark> findByUserId(@Param("userId") UUID userId, Pageable pageable);
}
