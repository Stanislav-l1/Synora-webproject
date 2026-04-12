package com.synora.modules.message.service;

import com.synora.modules.message.dto.MessageResponse;
import com.synora.modules.message.dto.SendMessageRequest;
import com.synora.modules.message.entity.Message;
import com.synora.modules.message.repository.MessageRepository;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository       messageRepository;
    private final ChatService             chatService;
    private final SimpMessagingTemplate   messagingTemplate;

    @Transactional(readOnly = true)
    public PageResponse<MessageResponse> getHistory(UUID chatId, UUID userId, int page, int size) {
        chatService.assertMember(chatId, userId);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(messageRepository.findByChatId(chatId, pageable)
                .map(this::toResponse));
    }

    @Transactional
    public MessageResponse sendMessage(UUID chatId, User sender, SendMessageRequest req) {
        chatService.assertMember(chatId, sender.getId());

        Message replyTo = null;
        if (req.getReplyToId() != null) {
            replyTo = messageRepository.findById(req.getReplyToId())
                    .orElseThrow(() -> AppException.notFound("Message", req.getReplyToId()));
        }

        Message message = messageRepository.save(Message.builder()
                .chat(com.synora.modules.message.entity.Chat.builder().id(chatId).build())
                .sender(sender)
                .replyTo(replyTo)
                .content(req.getContent())
                .build());

        MessageResponse response = toResponse(message);

        // Broadcast via WebSocket to all chat subscribers
        messagingTemplate.convertAndSend("/topic/chat." + chatId, response);

        return response;
    }

    @Transactional
    public MessageResponse editMessage(UUID messageId, User currentUser, String newContent) {
        Message message = findOrThrow(messageId);
        checkOwner(message, currentUser);

        message.setContent(newContent);
        message.setEditedAt(Instant.now());
        MessageResponse response = toResponse(messageRepository.save(message));

        messagingTemplate.convertAndSend("/topic/chat." + message.getChat().getId() + ".edit", response);
        return response;
    }

    @Transactional
    public void deleteMessage(UUID messageId, User currentUser) {
        Message message = findOrThrow(messageId);
        checkOwner(message, currentUser);

        message.setDeleted(true);
        message.setContent(null);
        messageRepository.save(message);

        messagingTemplate.convertAndSend(
                "/topic/chat." + message.getChat().getId() + ".delete",
                java.util.Map.of("messageId", messageId));
    }

    // --- helpers ---

    private Message findOrThrow(UUID id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Message", id));
    }

    private void checkOwner(Message message, User user) {
        boolean isSiteAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!message.getSender().getId().equals(user.getId()) && !isSiteAdmin) {
            throw AppException.forbidden();
        }
    }

    public MessageResponse toResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .chatId(m.getChat().getId())
                .senderUsername(m.getSender().getUsername())
                .senderDisplayName(m.getSender().getDisplayName())
                .senderAvatarUrl(m.getSender().getAvatarUrl())
                .replyToId(m.getReplyTo() != null ? m.getReplyTo().getId() : null)
                .replyToContent(m.getReplyTo() != null && !m.getReplyTo().isDeleted()
                        ? m.getReplyTo().getContent() : null)
                .content(m.isDeleted() ? null : m.getContent())
                .deleted(m.isDeleted())
                .editedAt(m.getEditedAt())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
