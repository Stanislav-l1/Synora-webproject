package com.synora.modules.push.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubscribePushRequest {
    @NotBlank String endpoint;
    @NotBlank String p256dh;
    @NotBlank String auth;
}
