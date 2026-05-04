package com.synora.modules.analytics.repository;

import com.synora.modules.analytics.entity.PageView;
import com.synora.modules.analytics.entity.PageViewEntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface PageViewRepository extends JpaRepository<PageView, UUID> {

    long countByEntityTypeAndEntityIdAndViewedAtAfter(
            PageViewEntityType type, UUID entityId, Instant after);

    @Query("SELECT COUNT(DISTINCT v.viewerId) FROM PageView v " +
           "WHERE v.entityType = :type AND v.entityId = :entityId " +
           "AND v.viewedAt >= :after AND v.viewerId IS NOT NULL")
    long countUniqueViewers(@Param("type") PageViewEntityType type,
                            @Param("entityId") UUID entityId,
                            @Param("after") Instant after);

    @Query(value = """
            SELECT TO_CHAR(viewed_at::date, 'YYYY-MM-DD') AS day, COUNT(*) AS cnt
            FROM page_views
            WHERE entity_type = :type AND entity_id = :entityId AND viewed_at >= :after
            GROUP BY viewed_at::date
            ORDER BY viewed_at::date
            """, nativeQuery = true)
    List<Object[]> countByDayForEntity(@Param("type") String type,
                                       @Param("entityId") UUID entityId,
                                       @Param("after") Instant after);

    boolean existsByEntityTypeAndEntityIdAndViewerIdAndViewedAtAfter(
            PageViewEntityType type, UUID entityId, UUID viewerId, Instant after);
}
