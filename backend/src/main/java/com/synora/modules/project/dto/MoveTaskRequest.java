package com.synora.modules.project.dto;

import lombok.Data;

@Data
public class MoveTaskRequest {
    private Long columnId;   // null = unassigned
    private int  orderIndex;
}
