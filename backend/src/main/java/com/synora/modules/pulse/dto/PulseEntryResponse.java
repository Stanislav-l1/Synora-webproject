package com.synora.modules.pulse.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PulseEntryResponse {
    private String type;
    private String actor;
    private String text;
    private Instant createdAt;
}
