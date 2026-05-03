package com.synora.modules.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SkillDto {
    private Long id;
    private String name;
    private Short level;
}
