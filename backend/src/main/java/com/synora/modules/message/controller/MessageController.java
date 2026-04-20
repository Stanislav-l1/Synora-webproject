package com.synora.modules.message.controller;

import com.synora.modules.message.dto.MessageResponse;
import com.synora.modules.message.dto.SendMessageRequest;
import com.synora.modules.message.dto.WsMessage;
import com.synora.modules.message.service.MessageService;
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
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@Tag(name = "Messages", description = "Chat messages — REST + WebSocket")
@RestController
@RequestMapping("/api/v1/chats/{chatId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService                                 messageService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final com.synora.modules.message.service.ChatService chatService;

    // ───── REST endpoints ─────

    @Operation(summary = "Get message history (paginated)", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MessageResponse>>> getHistory(
            @PathVariable UUID chatId,
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "30") int size) {

        return ResponseEntity.ok(ApiResponse.ok(
                messageService.getHistory(chatId, currentUser.getId(), page, size)));
    }

    @Operation(summary = "Send a message via REST", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @PathVariable UUID chatId,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody SendMessageRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Message sent",
                        messageService.sendMessage(chatId, currentUser, req)));
    }

    @Operation(summary = "Edit a message", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/{messageId}")
    public ResponseEntity<ApiResponse<MessageResponse>> editMessage(
            @PathVariable UUID chatId,
            @PathVariable UUID messageId,
            @AuthenticationPrincipal User currentUser,
            @RequestBody java.util.Map<String, String> body) {

        return ResponseEntity.ok(ApiResponse.ok("Message updated",
                messageService.editMessage(messageId, currentUser, body.get("content"))));
    }

    @Operation(summary = "Delete a message", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable UUID chatId,
            @PathVariable UUID messageId,
            @AuthenticationPrincipal User currentUser) {

        messageService.deleteMessage(messageId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    // ───── WebSocket STOMP endpoint ─────

    /**
     * Client sends to: /app/chat/{chatId}/send
     * Broadcast to:    /topic/chat.{chatId}
     *
     * The Principal is the authenticated user injected by Spring Security via
     * JwtChannelInterceptor (see WebSocketSecurityConfig).
     */
    @MessageMapping("/chat/{chatId}/send")
    public void handleWsMessage(
            @DestinationVariable UUID chatId,
            @Payload WsMessage payload,
            Principal principal) {

        // principal.getName() == username set by JwtChannelInterceptor
        // We delegate to the service which looks up the User and broadcasts
        SendMessageRequest req = new SendMessageRequest();
        req.setContent(payload.getContent());
        req.setReplyToId(payload.getReplyToId());

        // Resolve User from principal — the interceptor stores the full User in the session
        // Spring Security populates a UsernamePasswordAuthenticationToken as Principal
        User sender = (User) ((org.springframework.security.authentication
                .UsernamePasswordAuthenticationToken) principal).getPrincipal();

        messageService.sendMessage(chatId, sender, req);
    }

    /**
     * Client sends to: /app/chat/{chatId}/typing
     * Broadcast to:    /topic/chat.{chatId}.typing
     *
     * No payload — just the fact that this user is typing. We broadcast their
     * userId + displayName so other clients can show "X is typing...".
     */
    @MessageMapping("/chat/{chatId}/typing")
    public void handleTyping(
            @DestinationVariable UUID chatId,
            Principal principal) {

        User sender = (User) ((org.springframework.security.authentication
                .UsernamePasswordAuthenticationToken) principal).getPrincipal();

        chatService.assertMember(chatId, sender.getId());

        messagingTemplate.convertAndSend(
                "/topic/chat." + chatId + ".typing",
                java.util.Map.of(
                        "userId",      sender.getId().toString(),
                        "username",    sender.getUsername(),
                        "displayName", sender.getDisplayName() != null ? sender.getDisplayName() : sender.getUsername()));
    }
}
