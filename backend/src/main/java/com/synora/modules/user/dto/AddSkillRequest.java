package com.synora.modules.user.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AddSkillRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @Min(1) @Max(5)
    private Short level;
}
