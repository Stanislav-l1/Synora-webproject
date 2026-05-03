package com.synora.modules.post.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "post_reactions")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PostReaction {

    @EmbeddedId
    private PostReactionId id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "reaction_type")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private ReactionType type;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
