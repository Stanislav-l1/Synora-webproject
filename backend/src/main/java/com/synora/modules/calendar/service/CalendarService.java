package com.synora.modules.calendar.service;

import com.synora.modules.calendar.dto.*;
import com.synora.modules.calendar.entity.*;
import com.synora.modules.calendar.repository.CalendarEventAttendeeRepository;
import com.synora.modules.calendar.repository.CalendarEventRepository;
import com.synora.modules.project.entity.Project;
import com.synora.modules.project.repository.ProjectRepository;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarEventRepository eventRepository;
    private final CalendarEventAttendeeRepository attendeeRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<CalendarEventResponse> listInRange(UUID userId, Instant from, Instant to) {
        if (to.isBefore(from)) throw AppException.badRequest("'to' must be >= 'from'");
        return eventRepository.findInRangeForUser(userId, from, to)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CalendarEventResponse get(UUID eventId, UUID userId) {
        CalendarEvent e = eventRepository.findById(eventId)
                .orElseThrow(() -> AppException.notFound("CalendarEvent", eventId));
        requireViewer(e, userId);
        return toResponse(e);
    }

    @Transactional
    public CalendarEventResponse create(UUID userId, CreateCalendarEventRequest req) {
        if (req.getEndsAt().isBefore(req.getStartsAt()))
            throw AppException.badRequest("endsAt must be >= startsAt");

        User owner = userRepository.findById(userId)
                .orElseThrow(() -> AppException.notFound("User", userId));

        Project project = null;
        if (req.getProjectId() != null) {
            project = projectRepository.findById(req.getProjectId())
                    .orElseThrow(() -> AppException.notFound("Project", req.getProjectId()));
        }

        CalendarEvent event = CalendarEvent.builder()
                .owner(owner)
                .project(project)
                .type(parseType(req.getType()))
                .title(req.getTitle())
                .description(req.getDescription())
                .startsAt(req.getStartsAt())
                .endsAt(req.getEndsAt())
                .allDay(req.isAllDay())
                .location(req.getLocation())
                .meetingUrl(req.getMeetingUrl())
                .color(req.getColor())
                .build();

        event = eventRepository.save(event);

        if (req.getAttendeeIds() != null) {
            for (UUID attendeeId : req.getAttendeeIds()) {
                if (attendeeId.equals(userId)) continue;
                User u = userRepository.findById(attendeeId).orElse(null);
                if (u == null) continue;
                CalendarEventAttendee a = CalendarEventAttendee.builder()
                        .id(new CalendarEventAttendeeId(event.getId(), u.getId()))
                        .event(event)
                        .user(u)
                        .status(AttendeeStatus.INVITED)
                        .build();
                attendeeRepository.save(a);
                event.getAttendees().add(a);
            }
        }
        return toResponse(event);
    }

    @Transactional
    public CalendarEventResponse update(UUID eventId, UUID userId, UpdateCalendarEventRequest req) {
        CalendarEvent e = eventRepository.findById(eventId)
                .orElseThrow(() -> AppException.notFound("CalendarEvent", eventId));
        if (!e.getOwner().getId().equals(userId)) throw AppException.forbidden();

        if (req.getTitle() != null) e.setTitle(req.getTitle());
        if (req.getDescription() != null) e.setDescription(req.getDescription());
        if (req.getStartsAt() != null) e.setStartsAt(req.getStartsAt());
        if (req.getEndsAt() != null) e.setEndsAt(req.getEndsAt());
        if (req.getAllDay() != null) e.setAllDay(req.getAllDay());
        if (req.getLocation() != null) e.setLocation(req.getLocation());
        if (req.getMeetingUrl() != null) e.setMeetingUrl(req.getMeetingUrl());
        if (req.getColor() != null) e.setColor(req.getColor());
        if (req.getType() != null) e.setType(parseType(req.getType()));

        if (e.getEndsAt().isBefore(e.getStartsAt()))
            throw AppException.badRequest("endsAt must be >= startsAt");

        return toResponse(e);
    }

    @Transactional
    public void delete(UUID eventId, UUID userId) {
        CalendarEvent e = eventRepository.findById(eventId)
                .orElseThrow(() -> AppException.notFound("CalendarEvent", eventId));
        if (!e.getOwner().getId().equals(userId)) throw AppException.forbidden();
        eventRepository.delete(e);
    }

    @Transactional
    public void respond(UUID eventId, UUID userId, String statusStr) {
        AttendeeStatus status;
        try {
            status = AttendeeStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw AppException.badRequest("Invalid status");
        }
        if (status == AttendeeStatus.INVITED) throw AppException.badRequest("Cannot set back to INVITED");

        var id = new CalendarEventAttendeeId(eventId, userId);
        var attendee = attendeeRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Invite", eventId));
        attendee.setStatus(status);
    }

    private void requireViewer(CalendarEvent e, UUID userId) {
        if (e.getOwner().getId().equals(userId)) return;
        boolean invited = e.getAttendees().stream()
                .anyMatch(a -> a.getUser().getId().equals(userId));
        if (!invited) throw AppException.forbidden();
    }

    private CalendarEventType parseType(String s) {
        if (s == null || s.isBlank()) return CalendarEventType.MEETING;
        try {
            return CalendarEventType.valueOf(s.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw AppException.badRequest("Invalid event type");
        }
    }

    private CalendarEventResponse toResponse(CalendarEvent e) {
        List<AttendeeDto> attendeeDtos = new ArrayList<>();
        for (var a : e.getAttendees()) {
            attendeeDtos.add(AttendeeDto.builder()
                    .userId(a.getUser().getId())
                    .username(a.getUser().getUsername())
                    .displayName(a.getUser().getDisplayName())
                    .avatarUrl(a.getUser().getAvatarUrl())
                    .status(a.getStatus().name())
                    .build());
        }
        var b = CalendarEventResponse.builder()
                .id(e.getId())
                .type(e.getType().name())
                .title(e.getTitle())
                .description(e.getDescription())
                .startsAt(e.getStartsAt())
                .endsAt(e.getEndsAt())
                .allDay(e.isAllDay())
                .location(e.getLocation())
                .meetingUrl(e.getMeetingUrl())
                .color(e.getColor())
                .ownerId(e.getOwner().getId())
                .ownerUsername(e.getOwner().getUsername())
                .ownerDisplayName(e.getOwner().getDisplayName())
                .attendees(attendeeDtos)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt());
        if (e.getProject() != null) {
            b.projectId(e.getProject().getId()).projectName(e.getProject().getName());
        }
        return b.build();
    }
}
