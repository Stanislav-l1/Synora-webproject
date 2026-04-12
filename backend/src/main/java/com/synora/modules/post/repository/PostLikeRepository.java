package com.synora.modules.post.repository;

import com.synora.modules.post.entity.PostLike;
import com.synora.modules.post.entity.PostLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostLikeRepository extends JpaRepository<PostLike, PostLikeId> {
}
