package com.synora.modules.project.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kanban_columns")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class KanbanColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 7)
    private String color;

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private short orderIndex = 0;

    @Column(name = "wip_limit")
    private Short wipLimit;
}
