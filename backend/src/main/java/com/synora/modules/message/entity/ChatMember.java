package com.synora.modules.message.entity;

import com.synora.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "chat_members")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMember {

    @EmbeddedId
    private ChatMemberId id;

    @MapsId("chatId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id")
    private Chat chat;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "is_admin", nullable = false)
    @Builder.Default
    private boolean admin = false;

    @Column(name = "joined_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant joinedAt;

    @Column(name = "last_read_at")
    private Instant lastReadAt;

    @Column(name = "is_muted", nullable = false)
    @Builder.Default
    private boolean muted = false;
}
