package com.synora.modules.calendar.controller;

import com.synora.modules.calendar.dto.CreateCalendarEventRequest;
import com.synora.modules.calendar.dto.RespondToInviteRequest;
import com.synora.modules.calendar.dto.UpdateCalendarEventRequest;
import com.synora.modules.calendar.service.CalendarService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
@Tag(name = "Calendar")
@SecurityRequirement(name = "bearerAuth")
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/events")
    @Operation(summary = "List events in [from, to) range")
    public ResponseEntity<?> list(
            @AuthenticationPrincipal User currentUser,
            @RequestParam Instant from,
            @RequestParam Instant to) {
        return ResponseEntity.ok(ApiResponse.ok(
                calendarService.listInRange(currentUser.getId(), from, to)));
    }

    @GetMapping("/events/{id}")
    @Operation(summary = "Get a single event")
    public ResponseEntity<?> get(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(
                calendarService.get(id, currentUser.getId())));
    }

    @PostMapping("/events")
    @Operation(summary = "Create event")
    public ResponseEntity<?> create(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateCalendarEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                "Event created",
                calendarService.create(currentUser.getId(), request)));
    }

    @PatchMapping("/events/{id}")
    @Operation(summary = "Update event (owner only)")
    public ResponseEntity<?> update(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateCalendarEventRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Event updated",
                calendarService.update(id, currentUser.getId(), request)));
    }

    @DeleteMapping("/events/{id}")
    @Operation(summary = "Delete event (owner only)")
    public ResponseEntity<?> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        calendarService.delete(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Event deleted", null));
    }

    @PostMapping("/events/{id}/respond")
    @Operation(summary = "Respond to invite (ACCEPTED | DECLINED | TENTATIVE)")
    public ResponseEntity<?> respond(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody RespondToInviteRequest request) {
        calendarService.respond(id, currentUser.getId(), request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Response recorded", null));
    }
}
