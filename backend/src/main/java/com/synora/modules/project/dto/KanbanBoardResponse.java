package com.synora.modules.project.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter @Builder
public class KanbanBoardResponse {
    private UUID   projectId;
    private String projectName;
    private List<KanbanColumnResponse> columns;
}
