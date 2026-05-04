package com.synora.modules.analytics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "page_views")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PageView {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 50)
    private PageViewEntityType entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "viewer_id")
    private UUID viewerId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Builder.Default
    @Column(name = "viewed_at", nullable = false)
    private Instant viewedAt = Instant.now();
}
