package com.synora.modules.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "user_achievements")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAchievement {

    @EmbeddedId
    private UserAchievementId id;

    @CreatedDate
    @Column(name = "awarded_at", nullable = false, updatable = false)
    private Instant awardedAt;
}
