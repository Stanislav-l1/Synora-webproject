package com.synora.modules.calendar.repository;

import com.synora.modules.calendar.entity.CalendarEventAttendee;
import com.synora.modules.calendar.entity.CalendarEventAttendeeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalendarEventAttendeeRepository
        extends JpaRepository<CalendarEventAttendee, CalendarEventAttendeeId> {
}
