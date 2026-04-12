package com.synora.modules.message.repository;

import com.synora.modules.message.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId ORDER BY m.createdAt DESC")
    Page<Message> findByChatId(@Param("chatId") UUID chatId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.chat.id = :chatId AND m.createdAt > " +
           "COALESCE((SELECT cm.lastReadAt FROM ChatMember cm " +
           "WHERE cm.id.chatId = :chatId AND cm.id.userId = :userId), :epoch)")
    long countUnread(@Param("chatId") UUID chatId,
                     @Param("userId") UUID userId,
                     @Param("epoch") Instant epoch);
}
