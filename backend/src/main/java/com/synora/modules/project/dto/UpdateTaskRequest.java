package com.synora.modules.project.dto;

import com.synora.modules.project.entity.TaskPriority;
import com.synora.modules.project.entity.TaskStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdateTaskRequest {

    @Size(max = 500)
    private String title;

    private String description;

    private TaskStatus   status;
    private TaskPriority priority;

    private UUID      assigneeId;
    private LocalDate dueDate;
    private Short     storyPoints;
}
