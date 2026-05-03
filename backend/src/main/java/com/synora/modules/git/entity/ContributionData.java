package com.synora.modules.git.entity;

import com.synora.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "contribution_data")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ContributionData {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "git_provider")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private GitProvider provider;

    @Column(nullable = false)
    private short year;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Integer> data = new java.util.HashMap<>();

    @Column(name = "synced_at", nullable = false)
    private Instant syncedAt;
}
