package com.synora.modules.career.entity;

import com.synora.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "job_saves")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class JobSave {

    @EmbeddedId
    private JobSaveId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("jobId")
    @JoinColumn(name = "job_id")
    private JobPosting job;

    @Builder.Default
    @Column(name = "saved_at", nullable = false)
    private Instant savedAt = Instant.now();

    @Embeddable
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @EqualsAndHashCode
    public static class JobSaveId implements Serializable {
        @Column(name = "user_id") private UUID userId;
        @Column(name = "job_id")  private UUID jobId;
    }
}
