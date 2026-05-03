package com.synora.modules.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class SkillEndorsementId implements Serializable {

    @Column(name = "skill_id", nullable = false)
    private Long skillId;

    @Column(name = "endorser_id", nullable = false)
    private UUID endorserId;
}
