package com.synora.modules.user.repository;

import com.synora.modules.user.entity.UserAchievement;
import com.synora.modules.user.entity.UserAchievementId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserAchievementRepository
        extends JpaRepository<UserAchievement, UserAchievementId> {

    List<UserAchievement> findByIdUserIdOrderByAwardedAtDesc(UUID userId);

    boolean existsByIdUserIdAndIdCode(UUID userId, String code);
}
