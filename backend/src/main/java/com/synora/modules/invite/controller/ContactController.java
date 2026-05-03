package com.synora.modules.invite.controller;

import com.synora.modules.invite.dto.ContactResponse;
import com.synora.modules.invite.dto.ImportContactsRequest;
import com.synora.modules.invite.service.ContactService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
import com.synora.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Contacts", description = "Imported address book + matches with existing users")
@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ContactController {

    private final ContactService contactService;

    @Operation(summary = "Import contacts and try to match them to existing users")
    @PostMapping("/import")
    public ResponseEntity<ApiResponse<Map<String, Object>>> importContacts(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ImportContactsRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Contacts imported", contactService.importContacts(currentUser, req)));
    }

    @Operation(summary = "List my imported contacts")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ContactResponse>>> list(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.ok(contactService.list(currentUser.getId(), page, size)));
    }

    @Operation(summary = "Contacts already registered on Synora")
    @GetMapping("/matched")
    public ResponseEntity<ApiResponse<List<ContactResponse>>> matched(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(contactService.matched(currentUser.getId())));
    }

    @Operation(summary = "Delete a contact")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        contactService.delete(currentUser, id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
}
