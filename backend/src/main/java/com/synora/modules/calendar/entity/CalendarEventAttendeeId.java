package com.synora.modules.calendar.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CalendarEventAttendeeId implements Serializable {

    @Column(name = "event_id")
    private UUID eventId;

    @Column(name = "user_id")
    private UUID userId;
}
