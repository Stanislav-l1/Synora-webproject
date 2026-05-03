package com.synora.modules.calendar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class CreateCalendarEventRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 5000)
    private String description;

    @NotNull
    private Instant startsAt;

    @NotNull
    private Instant endsAt;

    private boolean allDay;

    @Size(max = 255)
    private String location;

    @Size(max = 500)
    private String meetingUrl;

    @Size(max = 7)
    private String color;

    /** MEETING | CALL | DEADLINE | TASK | TEAM_EVENT | REMINDER */
    private String type;

    private UUID projectId;

    private List<UUID> attendeeIds;
}
