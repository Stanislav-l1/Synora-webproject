package com.synora.modules.invite.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ImportContactsRequest {

    @NotEmpty
    @Size(max = 500)
    @Valid
    private List<ContactEntry> contacts;

    @Size(max = 32)
    private String source;

    @Data
    public static class ContactEntry {
        @jakarta.validation.constraints.NotBlank
        @jakarta.validation.constraints.Email
        @Size(max = 255)
        private String email;

        @Size(max = 150)
        private String name;
    }
}
