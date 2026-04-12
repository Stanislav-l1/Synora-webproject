package com.synora.modules.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateKanbanColumnRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 7)
    private String color;

    private short orderIndex = 0;

    private Short wipLimit;
}
