package com.synora.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank
    private String login;       // username или email

    @NotBlank
    private String password;
}
