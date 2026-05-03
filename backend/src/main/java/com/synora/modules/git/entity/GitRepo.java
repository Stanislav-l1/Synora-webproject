package com.synora.modules.git.entity;

import com.synora.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "git_repositories")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class GitRepo {

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

    @Column(name = "external_id", nullable = false, length = 100)
    private String externalId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "full_name", length = 300)
    private String fullName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "homepage_url", length = 500)
    private String homepageUrl;

    @Column(length = 80)
    private String language;

    @Column(columnDefinition = "TEXT[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Builder.Default
    private List<String> topics = new java.util.ArrayList<>();

    @Builder.Default
    @Column(name = "stars_count", nullable = false)
    private int starsCount = 0;

    @Builder.Default
    @Column(name = "forks_count", nullable = false)
    private int forksCount = 0;

    @Builder.Default
    @Column(name = "watchers_count", nullable = false)
    private int watchersCount = 0;

    @Builder.Default
    @Column(name = "open_issues", nullable = false)
    private int openIssues = 0;

    @Builder.Default
    @Column(name = "is_private", nullable = false)
    private boolean privateRepo = false;

    @Builder.Default
    @Column(name = "is_fork", nullable = false)
    private boolean fork = false;

    @Builder.Default
    @Column(name = "is_featured", nullable = false)
    private boolean featured = false;

    @Column(name = "last_pushed_at")
    private Instant lastPushedAt;

    @Column(name = "synced_at", nullable = false)
    private Instant syncedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
