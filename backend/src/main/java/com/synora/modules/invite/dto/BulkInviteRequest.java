package com.synora.modules.invite.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class BulkInviteRequest {

    @NotEmpty
    @Size(max = 100)
    private List<@jakarta.validation.constraints.Email String> emails;

    @Size(max = 1000)
    private String message;
}
