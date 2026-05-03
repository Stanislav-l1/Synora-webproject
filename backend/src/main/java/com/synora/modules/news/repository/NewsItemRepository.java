package com.synora.modules.news.repository;

import com.synora.modules.news.entity.NewsItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface NewsItemRepository extends JpaRepository<NewsItem, UUID> {

    @Query("SELECT n FROM NewsItem n ORDER BY n.publishedAt DESC")
    Page<NewsItem> findAllOrderByPublishedAtDesc(Pageable pageable);

    @Query("""
            SELECT DISTINCT n FROM NewsItem n JOIN n.tags t
            WHERE t.id = :tagId
            ORDER BY n.publishedAt DESC
            """)
    Page<NewsItem> findByTagId(@Param("tagId") Long tagId, Pageable pageable);
}
