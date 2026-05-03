package com.synora.modules.user.repository;

import com.synora.modules.user.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    List<UserSkill> findByUserIdOrderByIdAsc(UUID userId);
    Optional<UserSkill> findByUserIdAndSkillName(UUID userId, String skillName);
    void deleteByUserIdAndId(UUID userId, Long id);

    @org.springframework.data.jpa.repository.Query(
            "SELECT DISTINCT s.userId FROM UserSkill s " +
            "WHERE LOWER(s.skillName) IN :names AND s.userId <> :excludeId")
    List<UUID> findUserIdsBySkillNamesLower(
            @org.springframework.data.repository.query.Param("names") java.util.Collection<String> lowerNames,
            @org.springframework.data.repository.query.Param("excludeId") UUID excludeId);
}
