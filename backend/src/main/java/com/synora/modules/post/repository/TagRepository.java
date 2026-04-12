package com.synora.modules.post.repository;

import com.synora.modules.post.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByName(String name);

    List<Tag> findAllByOrderByUsageCountDesc();

    List<Tag> findByNameContainingIgnoreCaseOrderByUsageCountDesc(String query);
}
