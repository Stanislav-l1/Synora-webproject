package com.synora.modules.career.entity;

import com.synora.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "job_postings")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class JobPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 150)
    private String company;

    @Column(length = 150)
    private String location;

    @Builder.Default
    @Column(nullable = false)
    private boolean remote = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "job_type")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private JobType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "job_status")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Builder.Default
    private JobStatus status = JobStatus.OPEN;

    @Column(name = "salary_min")
    private Integer salaryMin;

    @Column(name = "salary_max")
    private Integer salaryMax;

    @Column(length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "experience_years")
    private Short experienceYears;

    @Column(name = "application_url", length = 500)
    private String applicationUrl;

    @Builder.Default
    @Column(name = "applications_count", nullable = false)
    private int applicationsCount = 0;

    @Builder.Default
    @Column(name = "views_count", nullable = false)
    private int viewsCount = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    @Builder.Default
    private Set<String> skills = new HashSet<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
