package com.synora.modules.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class WeeklyActivityResponse {
    /** ISO date of each bucket (Mon..Sun of the current week, UTC). */
    private List<LocalDate> days;
    /** Counts aligned with `days`. */
    private List<Long> counts;
    /** This week total. */
    private long total;
    /** Percent change versus the prior 7-day window. null when prior period is zero. */
    private Integer deltaPercent;
}
