package com.synora.modules.calendar.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CalendarEventResponse {
    private UUID id;
    private String type;
    private String title;
    private String description;
    private Instant startsAt;
    private Instant endsAt;
    private boolean allDay;
    private String location;
    private String meetingUrl;
    private String color;
    private UUID ownerId;
    private String ownerUsername;
    private String ownerDisplayName;
    private UUID projectId;
    private String projectName;
    private List<AttendeeDto> attendees;
    private Instant createdAt;
    private Instant updatedAt;
}
