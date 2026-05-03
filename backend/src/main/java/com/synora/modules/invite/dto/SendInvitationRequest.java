package com.synora.modules.invite.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SendInvitationRequest {

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @Size(max = 1000)
    private String message;
}
