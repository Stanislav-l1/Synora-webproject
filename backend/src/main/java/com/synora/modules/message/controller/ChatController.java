package com.synora.modules.message.controller;

import com.synora.modules.message.dto.ChatMemberResponse;
import com.synora.modules.message.dto.ChatResponse;
import com.synora.modules.message.dto.CreateChatRequest;
import com.synora.modules.message.service.ChatService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
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
import java.util.UUID;

@Tag(name = "Chats", description = "Chat management")
@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @Operation(summary = "Get my chats", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatResponse>>> getMyChats(
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(ApiResponse.ok(chatService.getMyChats(currentUser.getId())));
    }

    @Operation(summary = "Create or get direct chat", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/direct/{userId}")
    public ResponseEntity<ApiResponse<ChatResponse>> getOrCreateDirect(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID userId) {

        return ResponseEntity.ok(
                ApiResponse.ok(chatService.createOrGetDirect(currentUser, userId)));
    }

    @Operation(summary = "Create group chat", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/group")
    public ResponseEntity<ApiResponse<ChatResponse>> createGroup(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateChatRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Group chat created",
                        chatService.createGroup(currentUser, req)));
    }

    @Operation(summary = "Mark all messages as read", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{chatId}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @PathVariable UUID chatId,
            @AuthenticationPrincipal User currentUser) {

        chatService.markRead(chatId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Get or create project chat", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<ChatResponse>> getOrCreateProjectChat(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(
                ApiResponse.ok(chatService.getOrCreateProjectChat(projectId, currentUser)));
    }

    @Operation(summary = "Add a member to a GROUP chat", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{chatId}/members/{userId}")
    public ResponseEntity<ApiResponse<ChatMemberResponse>> addMember(
            @PathVariable UUID chatId,
            @PathVariable UUID userId,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Member added",
                        chatService.addUserToGroup(chatId, userId, currentUser)));
    }

    @Operation(summary = "Remove a member from a GROUP chat (or leave)", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{chatId}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID chatId,
            @PathVariable UUID userId,
            @AuthenticationPrincipal User currentUser) {

        chatService.removeUserFromGroup(chatId, userId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
