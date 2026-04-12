package com.synora.modules.message.service;

import com.synora.modules.message.dto.*;
import com.synora.modules.message.entity.*;
import com.synora.modules.message.repository.*;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository       chatRepository;
    private final ChatMemberRepository memberRepository;
    private final MessageRepository    messageRepository;
    private final UserRepository       userRepository;

    @Transactional(readOnly = true)
    public List<ChatResponse> getMyChats(UUID userId) {
        return chatRepository.findByMember(userId).stream()
                .map(chat -> buildChatResponse(chat, userId))
                .toList();
    }

    @Transactional
    public ChatResponse createOrGetDirect(User me, UUID otherUserId) {
        // Return existing DIRECT chat if it exists
        return chatRepository.findDirectChat(me.getId(), otherUserId, ChatType.DIRECT)
                .map(chat -> buildChatResponse(chat, me.getId()))
                .orElseGet(() -> {
                    User other = userRepository.findById(otherUserId)
                            .orElseThrow(() -> AppException.notFound("User", otherUserId));
                    Chat chat = chatRepository.save(Chat.builder()
                            .type(ChatType.DIRECT)
                            .createdBy(me)
                            .build());
                    addMember(chat, me, true);
                    addMember(chat, other, false);
                    return buildChatResponse(chat, me.getId());
                });
    }

    @Transactional
    public ChatResponse createGroup(User creator, CreateChatRequest req) {
        if (req.getType() != ChatType.GROUP) {
            throw AppException.badRequest("Use POST /chats/direct for direct chats");
        }
        Chat chat = chatRepository.save(Chat.builder()
                .type(ChatType.GROUP)
                .name(req.getName())
                .avatarUrl(req.getAvatarUrl())
                .createdBy(creator)
                .build());

        addMember(chat, creator, true);
        for (UUID memberId : req.getMemberIds()) {
            if (!memberId.equals(creator.getId())) {
                User member = userRepository.findById(memberId)
                        .orElseThrow(() -> AppException.notFound("User", memberId));
                addMember(chat, member, false);
            }
        }
        return buildChatResponse(chat, creator.getId());
    }

    @Transactional
    public void markRead(UUID chatId, UUID userId) {
        ChatMember member = memberRepository.findById(new ChatMemberId(chatId, userId))
                .orElseThrow(() -> AppException.forbidden());
        member.setLastReadAt(java.time.Instant.now());
        memberRepository.save(member);
    }

    @Transactional(readOnly = true)
    public void assertMember(UUID chatId, UUID userId) {
        if (!memberRepository.existsByIdChatIdAndIdUserId(chatId, userId)) {
            throw AppException.forbidden();
        }
    }

    // --- helpers ---

    private void addMember(Chat chat, User user, boolean admin) {
        memberRepository.save(ChatMember.builder()
                .id(new ChatMemberId(chat.getId(), user.getId()))
                .chat(chat)
                .user(user)
                .admin(admin)
                .build());
    }

    private ChatResponse buildChatResponse(Chat chat, UUID currentUserId) {
        List<ChatMember> members = memberRepository.findByIdChatId(chat.getId());

        var lastPage = messageRepository.findByChatId(chat.getId(),
                PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "createdAt")));
        MessageResponse lastMessage = lastPage.hasContent()
                ? toMessageResponse(lastPage.getContent().get(0))
                : null;

        long unread = messageRepository.countUnread(chat.getId(), currentUserId, Instant.EPOCH);

        return ChatResponse.builder()
                .id(chat.getId())
                .type(chat.getType().name())
                .name(chat.getName())
                .avatarUrl(chat.getAvatarUrl())
                .members(members.stream().map(m -> ChatMemberResponse.builder()
                        .userId(m.getUser().getId())
                        .username(m.getUser().getUsername())
                        .displayName(m.getUser().getDisplayName())
                        .avatarUrl(m.getUser().getAvatarUrl())
                        .admin(m.isAdmin())
                        .muted(m.isMuted())
                        .joinedAt(m.getJoinedAt())
                        .lastReadAt(m.getLastReadAt())
                        .build()).toList())
                .lastMessage(lastMessage)
                .unreadCount(unread)
                .createdAt(chat.getCreatedAt())
                .build();
    }

    private MessageResponse toMessageResponse(com.synora.modules.message.entity.Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .chatId(m.getChat().getId())
                .senderUsername(m.getSender().getUsername())
                .senderDisplayName(m.getSender().getDisplayName())
                .senderAvatarUrl(m.getSender().getAvatarUrl())
                .replyToId(m.getReplyTo() != null ? m.getReplyTo().getId() : null)
                .content(m.isDeleted() ? null : m.getContent())
                .deleted(m.isDeleted())
                .editedAt(m.getEditedAt())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
