package com.synora.modules.calendar.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AttendeeDto {
    private UUID userId;
    private String username;
    private String displayName;
    private String avatarUrl;
    private String status;
}
