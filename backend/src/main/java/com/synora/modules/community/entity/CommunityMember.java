package com.synora.modules.community.entity;

import com.synora.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "community_members")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CommunityMember {

    @EmbeddedId
    private CommunityMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("communityId")
    @JoinColumn(name = "community_id")
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "community_role")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Builder.Default
    private CommunityRole role = CommunityRole.MEMBER;

    @Column(name = "joined_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();
}
