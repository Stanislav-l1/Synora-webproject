package com.synora.modules.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserInterestId implements Serializable {

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "name", length = 60)
    private String name;
}
