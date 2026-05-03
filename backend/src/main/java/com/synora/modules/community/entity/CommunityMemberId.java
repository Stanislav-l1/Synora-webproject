package com.synora.modules.community.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class CommunityMemberId implements Serializable {
    private UUID communityId;
    private UUID userId;
}
