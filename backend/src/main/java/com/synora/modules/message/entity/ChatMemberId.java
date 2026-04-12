package com.synora.modules.message.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class ChatMemberId implements Serializable {

    @Column(name = "chat_id")
    private UUID chatId;

    @Column(name = "user_id")
    private UUID userId;
}
