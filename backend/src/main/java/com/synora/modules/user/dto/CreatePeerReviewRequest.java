package com.synora.modules.user.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePeerReviewRequest {

    @NotNull
    @Min(1) @Max(5)
    private Short score;

    private String context;

    @Size(max = 2000)
    private String comment;
}
