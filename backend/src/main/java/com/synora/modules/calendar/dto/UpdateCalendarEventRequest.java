package com.synora.modules.calendar.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
public class UpdateCalendarEventRequest {

    @Size(max = 200)
    private String title;

    @Size(max = 5000)
    private String description;

    private Instant startsAt;
    private Instant endsAt;
    private Boolean allDay;

    @Size(max = 255)
    private String location;

    @Size(max = 500)
    private String meetingUrl;

    @Size(max = 7)
    private String color;

    private String type;
}
