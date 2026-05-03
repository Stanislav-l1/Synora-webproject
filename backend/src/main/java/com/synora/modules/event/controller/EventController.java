package com.synora.modules.event.controller;

import com.synora.modules.event.dto.CreateEventRequest;
import com.synora.modules.event.dto.UpdateEventRequest;
import com.synora.modules.event.service.EventService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@Tag(name = "Community Events")
public class EventController {

    private final EventService eventService;

    @GetMapping
    @Operation(summary = "Discover published events")
    public ResponseEntity<?> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        var viewerId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(eventService.list(type, from, to, page, size, viewerId)));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get event by slug")
    public ResponseEntity<?> get(
            @PathVariable String slug,
            @AuthenticationPrincipal User currentUser) {
        var viewerId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(eventService.getBySlug(slug, viewerId)));
    }

    @GetMapping("/me")
    @Operation(summary = "My events (organizer)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> myEvents(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(eventService.myEvents(currentUser.getId(), page, size)));
    }

    @PostMapping
    @Operation(summary = "Create event")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> create(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Event created", eventService.create(currentUser, request)));
    }

    @PatchMapping("/{slug}")
    @Operation(summary = "Update event (organizer only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> update(
            @PathVariable String slug,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateEventRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Event updated", eventService.update(slug, currentUser, request)));
    }

    @DeleteMapping("/{slug}")
    @Operation(summary = "Delete event (organizer only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> delete(
            @PathVariable String slug,
            @AuthenticationPrincipal User currentUser) {
        eventService.delete(slug, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Event deleted", null));
    }

    @PostMapping("/{slug}/register")
    @Operation(summary = "Register for an event")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> register(
            @PathVariable String slug,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok("Registered", eventService.register(slug, currentUser)));
    }

    @DeleteMapping("/{slug}/register")
    @Operation(summary = "Cancel registration")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> cancelRegistration(
            @PathVariable String slug,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok("Cancelled", eventService.cancelRegistration(slug, currentUser)));
    }
}
