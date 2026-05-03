package com.synora.modules.calendar.repository;

import com.synora.modules.calendar.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, UUID> {

    @Query("""
            SELECT DISTINCT e FROM CalendarEvent e
            LEFT JOIN e.attendees a
            WHERE (e.owner.id = :userId OR a.user.id = :userId)
              AND e.startsAt < :to
              AND e.endsAt   >= :from
            ORDER BY e.startsAt
            """)
    List<CalendarEvent> findInRangeForUser(UUID userId, Instant from, Instant to);
}
