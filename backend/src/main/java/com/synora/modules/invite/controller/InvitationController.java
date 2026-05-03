package com.synora.modules.invite.controller;

import com.synora.modules.invite.dto.BulkInviteRequest;
import com.synora.modules.invite.dto.InvitationResponse;
import com.synora.modules.invite.dto.SendInvitationRequest;
import com.synora.modules.invite.service.InvitationService;
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
import java.util.UUID;

@Tag(name = "Invitations", description = "Send, list and revoke invitations")
@RestController
@RequestMapping("/api/v1/invitations")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class InvitationController {

    private final InvitationService invitationService;

    @Operation(summary = "Send a single invitation by email")
    @PostMapping
    public ResponseEntity<ApiResponse<InvitationResponse>> send(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody SendInvitationRequest req) {
        InvitationResponse resp = invitationService.send(currentUser, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Invitation created", resp));
    }

    @Operation(summary = "Send invitations in bulk (from contacts or manual list)")
    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<InvitationResponse>>> sendBulk(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody BulkInviteRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Invitations created", invitationService.sendBulk(currentUser, req)));
    }

    @Operation(summary = "List my sent invitations")
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<PageResponse<InvitationResponse>>> listMine(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(invitationService.listMine(currentUser.getId(), page, size)));
    }

    @Operation(summary = "Aggregate invitation stats")
    @GetMapping("/mine/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> myStats(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.ok(invitationService.myStats(currentUser.getId())));
    }

    @Operation(summary = "Preview an invitation by token (public)")
    @GetMapping("/preview/{token}")
    public ResponseEntity<ApiResponse<InvitationResponse>> preview(@PathVariable String token) {
        return ResponseEntity.ok(ApiResponse.ok(invitationService.preview(token)));
    }

    @Operation(summary = "Accept an invitation after registration")
    @PostMapping("/accept/{token}")
    public ResponseEntity<ApiResponse<InvitationResponse>> accept(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String token) {
        return ResponseEntity.ok(
                ApiResponse.ok("Invitation accepted", invitationService.accept(token, currentUser)));
    }

    @Operation(summary = "Revoke a pending invitation")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> revoke(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID id) {
        invitationService.revoke(currentUser, id);
        return ResponseEntity.ok(ApiResponse.ok("Invitation revoked", null));
    }
}
