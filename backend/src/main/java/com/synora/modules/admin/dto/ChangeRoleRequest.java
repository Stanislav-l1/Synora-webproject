package com.synora.modules.admin.dto;

import com.synora.modules.user.entity.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeRoleRequest {

    @NotNull
    private UserRole role;
}
