package com.synora.modules.admin.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BanUserRequest {

    @Size(max = 500)
    private String reason;
}
