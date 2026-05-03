package com.synora.modules.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class CreateEventRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 5000)
    private String description;

    @NotNull
    private Instant startsAt;

    @NotNull
    private Instant endsAt;

    private String timezone;

    @NotBlank
    private String type;

    private String coverUrl;
    private String location;
    private String venueName;
    private String onlineUrl;
    private boolean online;
    private Integer capacity;
    private List<String> tags;
    private UUID communityId;
    private boolean publish;
}
