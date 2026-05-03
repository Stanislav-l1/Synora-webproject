package com.synora.modules.event.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class UpdateEventRequest {

    @Size(max = 200)
    private String title;

    @Size(max = 5000)
    private String description;

    private Instant startsAt;
    private Instant endsAt;
    private String timezone;
    private String type;
    private String status;
    private String coverUrl;
    private String location;
    private String venueName;
    private String onlineUrl;
    private Boolean online;
    private Integer capacity;
    private List<String> tags;
}
