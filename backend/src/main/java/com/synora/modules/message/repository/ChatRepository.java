package com.synora.modules.message.repository;

import com.synora.modules.message.entity.Chat;
import com.synora.modules.message.entity.ChatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatRepository extends JpaRepository<Chat, UUID> {

    @Query("""
            SELECT c FROM Chat c
            JOIN ChatMember m ON m.id.chatId = c.id
            WHERE m.id.userId = :userId
            ORDER BY c.createdAt DESC
            """)
    List<Chat> findByMember(@Param("userId") UUID userId);

    @Query("""
            SELECT c FROM Chat c
            JOIN ChatMember m1 ON m1.id.chatId = c.id AND m1.id.userId = :userId1
            JOIN ChatMember m2 ON m2.id.chatId = c.id AND m2.id.userId = :userId2
            WHERE c.type = :type
            """)
    Optional<Chat> findDirectChat(
            @Param("userId1") UUID userId1,
            @Param("userId2") UUID userId2,
            @Param("type") ChatType type);

    Optional<Chat> findByProjectIdAndType(UUID projectId, ChatType type);
}
