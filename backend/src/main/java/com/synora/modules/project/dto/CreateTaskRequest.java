package com.synora.modules.project.dto;

import com.synora.modules.project.entity.TaskPriority;
import com.synora.modules.project.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateTaskRequest {

    @NotBlank
    @Size(max = 500)
    private String title;

    private String description;

    private TaskStatus   status   = TaskStatus.TODO;
    private TaskPriority priority = TaskPriority.MEDIUM;

    private Long      columnId;
    private UUID      assigneeId;
    private LocalDate dueDate;
    private Short     storyPoints;
}
