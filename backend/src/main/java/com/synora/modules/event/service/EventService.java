package com.synora.modules.event.service;

import com.synora.modules.community.entity.Community;
import com.synora.modules.community.repository.CommunityRepository;
import com.synora.modules.event.dto.CreateEventRequest;
import com.synora.modules.event.dto.EventResponse;
import com.synora.modules.event.dto.UpdateEventRequest;
import com.synora.modules.event.entity.*;
import com.synora.modules.event.repository.CommunityEventRepository;
import com.synora.modules.event.repository.EventRegistrationRepository;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class EventService {

    private final CommunityEventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final CommunityRepository communityRepository;

    @Transactional(readOnly = true)
    public PageResponse<EventResponse> list(String type, Instant from, Instant to, int page, int size, UUID viewerId) {
        CommunityEventType eventType = parseTypeOrNull(type);
        var pageable = PageRequest.of(page, size, Sort.by("startsAt").ascending());
        return PageResponse.from(
                eventRepository.search(eventType, from, to, pageable)
                        .map(e -> toResponse(e, viewerId))
        );
    }

    @Transactional(readOnly = true)
    public EventResponse getBySlug(String slug, UUID viewerId) {
        CommunityEvent e = eventRepository.findBySlug(slug)
                .orElseThrow(() -> AppException.notFound("Event", slug));
        if (e.getStatus() != CommunityEventStatus.PUBLISHED
                && (viewerId == null || !e.getOrganizer().getId().equals(viewerId))) {
            throw AppException.forbidden();
        }
        return toResponse(e, viewerId);
    }

    @Transactional(readOnly = true)
    public PageResponse<EventResponse> myEvents(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size);
        return PageResponse.from(
                eventRepository.findByOrganizerIdOrderByStartsAtDesc(userId, pageable)
                        .map(e -> toResponse(e, userId))
        );
    }

    @Transactional
    public EventResponse create(User organizer, CreateEventRequest req) {
        if (req.getEndsAt().isBefore(req.getStartsAt()))
            throw AppException.badRequest("endsAt must be >= startsAt");

        Community community = null;
        if (req.getCommunityId() != null) {
            community = communityRepository.findById(req.getCommunityId())
                    .orElseThrow(() -> AppException.notFound("Community", req.getCommunityId()));
        }

        String slug = generateUniqueSlug(req.getTitle());

        List<String> tags = req.getTags() != null ? req.getTags() : List.of();

        CommunityEvent event = CommunityEvent.builder()
                .organizer(organizer)
                .community(community)
                .type(parseType(req.getType()))
                .status(req.isPublish() ? CommunityEventStatus.PUBLISHED : CommunityEventStatus.DRAFT)
                .title(req.getTitle())
                .slug(slug)
                .description(req.getDescription())
                .coverUrl(req.getCoverUrl())
                .startsAt(req.getStartsAt())
                .endsAt(req.getEndsAt())
                .timezone(req.getTimezone() != null ? req.getTimezone() : "UTC")
                .location(req.getLocation())
                .venueName(req.getVenueName())
                .onlineUrl(req.getOnlineUrl())
                .online(req.isOnline())
                .capacity(req.getCapacity())
                .tags(tags.toArray(new String[0]))
                .build();

        return toResponse(eventRepository.save(event), organizer.getId());
    }

    @Transactional
    public EventResponse update(String slug, User currentUser, UpdateEventRequest req) {
        CommunityEvent e = eventRepository.findBySlug(slug)
                .orElseThrow(() -> AppException.notFound("Event", slug));
        if (!e.getOrganizer().getId().equals(currentUser.getId()))
            throw AppException.forbidden();

        if (req.getTitle() != null)       e.setTitle(req.getTitle());
        if (req.getDescription() != null) e.setDescription(req.getDescription());
        if (req.getStartsAt() != null)    e.setStartsAt(req.getStartsAt());
        if (req.getEndsAt() != null)      e.setEndsAt(req.getEndsAt());
        if (req.getTimezone() != null)    e.setTimezone(req.getTimezone());
        if (req.getCoverUrl() != null)    e.setCoverUrl(req.getCoverUrl());
        if (req.getLocation() != null)    e.setLocation(req.getLocation());
        if (req.getVenueName() != null)   e.setVenueName(req.getVenueName());
        if (req.getOnlineUrl() != null)   e.setOnlineUrl(req.getOnlineUrl());
        if (req.getOnline() != null)      e.setOnline(req.getOnline());
        if (req.getCapacity() != null)    e.setCapacity(req.getCapacity());
        if (req.getTags() != null)        e.setTags(req.getTags().toArray(new String[0]));
        if (req.getType() != null)        e.setType(parseType(req.getType()));
        if (req.getStatus() != null)      e.setStatus(parseStatus(req.getStatus()));

        if (e.getEndsAt().isBefore(e.getStartsAt()))
            throw AppException.badRequest("endsAt must be >= startsAt");

        return toResponse(e, currentUser.getId());
    }

    @Transactional
    public void delete(String slug, User currentUser) {
        CommunityEvent e = eventRepository.findBySlug(slug)
                .orElseThrow(() -> AppException.notFound("Event", slug));
        if (!e.getOrganizer().getId().equals(currentUser.getId()))
            throw AppException.forbidden();
        eventRepository.delete(e);
    }

    @Transactional
    public EventResponse register(String slug, User currentUser) {
        CommunityEvent e = eventRepository.findBySlug(slug)
                .orElseThrow(() -> AppException.notFound("Event", slug));
        if (e.getStatus() != CommunityEventStatus.PUBLISHED)
            throw AppException.badRequest("Event is not open for registration");

        boolean active = registrationRepository.existsByEventIdAndUserIdAndStatusNot(
                e.getId(), currentUser.getId(), EventRegistrationStatus.CANCELLED);
        if (active) throw AppException.conflict("Already registered");

        long registered = registrationRepository.countByEventIdAndStatus(e.getId(), EventRegistrationStatus.REGISTERED);
        EventRegistrationStatus regStatus = (e.getCapacity() != null && registered >= e.getCapacity())
                ? EventRegistrationStatus.WAITLISTED
                : EventRegistrationStatus.REGISTERED;

        EventRegistration reg = EventRegistration.builder()
                .event(e)
                .user(currentUser)
                .status(regStatus)
                .build();
        registrationRepository.save(reg);

        return toResponse(e, currentUser.getId());
    }

    @Transactional
    public EventResponse cancelRegistration(String slug, User currentUser) {
        CommunityEvent e = eventRepository.findBySlug(slug)
                .orElseThrow(() -> AppException.notFound("Event", slug));
        EventRegistration reg = registrationRepository
                .findByEventIdAndUserId(e.getId(), currentUser.getId())
                .orElseThrow(() -> AppException.notFound("Registration", slug));
        reg.setStatus(EventRegistrationStatus.CANCELLED);
        return toResponse(e, currentUser.getId());
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private EventResponse toResponse(CommunityEvent e, UUID viewerId) {
        long count = registrationRepository.countByEventIdAndStatus(e.getId(), EventRegistrationStatus.REGISTERED);

        String myStatus = null;
        if (viewerId != null) {
            var reg = registrationRepository.findByEventIdAndUserId(e.getId(), viewerId);
            myStatus = reg.map(r -> r.getStatus().name()).orElse(null);
        }

        var b = EventResponse.builder()
                .id(e.getId())
                .slug(e.getSlug())
                .type(e.getType().name())
                .status(e.getStatus().name())
                .title(e.getTitle())
                .description(e.getDescription())
                .coverUrl(e.getCoverUrl())
                .startsAt(e.getStartsAt())
                .endsAt(e.getEndsAt())
                .timezone(e.getTimezone())
                .location(e.getLocation())
                .venueName(e.getVenueName())
                .onlineUrl(e.getOnlineUrl())
                .online(e.isOnline())
                .capacity(e.getCapacity())
                .registeredCount(count)
                .tags(e.getTags() != null ? Arrays.asList(e.getTags()) : List.of())
                .organizerId(e.getOrganizer().getId())
                .organizerUsername(e.getOrganizer().getUsername())
                .organizerDisplayName(e.getOrganizer().getDisplayName())
                .organizerAvatarUrl(e.getOrganizer().getAvatarUrl())
                .myRegistrationStatus(myStatus)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt());

        if (e.getCommunity() != null) {
            b.communityId(e.getCommunity().getId())
             .communityName(e.getCommunity().getName())
             .communitySlug(e.getCommunity().getSlug());
        }
        return b.build();
    }

    private CommunityEventType parseType(String s) {
        try {
            return CommunityEventType.valueOf(s.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw AppException.badRequest("Invalid event type: " + s);
        }
    }

    private CommunityEventType parseTypeOrNull(String s) {
        if (s == null || s.isBlank()) return null;
        return parseType(s);
    }

    private CommunityEventStatus parseStatus(String s) {
        try {
            return CommunityEventStatus.valueOf(s.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw AppException.badRequest("Invalid event status: " + s);
        }
    }

    private static final Pattern NON_ALPHA = Pattern.compile("[^a-z0-9]+");

    private String generateUniqueSlug(String title) {
        String base = NON_ALPHA.matcher(
                Normalizer.normalize(title, Normalizer.Form.NFD)
                        .replaceAll("\\p{M}", "")
                        .toLowerCase(Locale.ROOT)
        ).replaceAll("-").replaceAll("^-|-$", "");

        String candidate = base;
        int suffix = 2;
        while (eventRepository.findBySlug(candidate).isPresent()) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }
}
