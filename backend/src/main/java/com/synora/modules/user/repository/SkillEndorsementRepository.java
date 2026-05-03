package com.synora.modules.user.repository;

import com.synora.modules.user.entity.SkillEndorsement;
import com.synora.modules.user.entity.SkillEndorsementId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SkillEndorsementRepository
        extends JpaRepository<SkillEndorsement, SkillEndorsementId> {

    long countByIdSkillId(Long skillId);

    boolean existsByIdSkillIdAndIdEndorserId(Long skillId, UUID endorserId);

    @Query("""
            SELECT COUNT(e) FROM SkillEndorsement e
            JOIN UserSkill s ON s.id = e.id.skillId
            WHERE s.userId = :userId
            """)
    long countByUserId(@Param("userId") UUID userId);

    @Query("""
            SELECT e.id.endorserId FROM SkillEndorsement e
            WHERE e.id.skillId = :skillId
            ORDER BY e.createdAt DESC
            """)
    List<UUID> findRecentEndorserIds(@Param("skillId") Long skillId,
                                     org.springframework.data.domain.Pageable pageable);
}
