package com.synora.modules.message.repository;

import com.synora.modules.message.entity.ChatMember;
import com.synora.modules.message.entity.ChatMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMemberRepository extends JpaRepository<ChatMember, ChatMemberId> {

    List<ChatMember> findByIdChatId(UUID chatId);

    boolean existsByIdChatIdAndIdUserId(UUID chatId, UUID userId);
}
