package com.synora.modules.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class OnboardingRequest {

    @Size(max = 60)
    private String specialization;

    @Size(max = 60)
    private String careerGoal;

    @Size(max = 120)
    private String availableFor;

    private List<@Size(max = 60) String> interests;
    private List<@Size(max = 100) String> technologies;
}
