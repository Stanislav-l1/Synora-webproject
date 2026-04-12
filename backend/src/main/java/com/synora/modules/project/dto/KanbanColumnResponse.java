package com.synora.modules.project.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter @Builder
public class KanbanColumnResponse {
    private Long   id;
    private String name;
    private String color;
    private short  orderIndex;
    private Short  wipLimit;
    private List<TaskResponse> tasks;
}
