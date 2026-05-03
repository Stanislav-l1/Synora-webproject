package com.synora.modules.user.service;

import com.synora.modules.user.dto.EndorsementSummary;
import com.synora.modules.user.entity.SkillEndorsement;
import com.synora.modules.user.entity.SkillEndorsementId;
import com.synora.modules.user.entity.User;
import com.synora.modules.user.entity.UserSkill;
import com.synora.modules.user.repository.SkillEndorsementRepository;
import com.synora.modules.user.repository.UserRepository;
import com.synora.modules.user.repository.UserSkillRepository;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EndorsementService {

    private final SkillEndorsementRepository endorsementRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;

    @Transactional
    public long endorse(User endorser, Long skillId) {
        UserSkill skill = userSkillRepository.findById(skillId)
                .orElseThrow(() -> AppException.notFound("Skill", skillId));
        if (skill.getUserId().equals(endorser.getId())) {
            throw AppException.badRequest("Can't endorse your own skill");
        }
        SkillEndorsementId id = new SkillEndorsementId(skillId, endorser.getId());
        if (!endorsementRepository.existsByIdSkillIdAndIdEndorserId(skillId, endorser.getId())) {
            endorsementRepository.save(SkillEndorsement.builder().id(id).build());
        }
        return endorsementRepository.countByIdSkillId(skillId);
    }

    @Transactional
    public long unendorse(User endorser, Long skillId) {
        UserSkill skill = userSkillRepository.findById(skillId)
                .orElseThrow(() -> AppException.notFound("Skill", skillId));
        SkillEndorsementId id = new SkillEndorsementId(skillId, endorser.getId());
        endorsementRepository.findById(id).ifPresent(endorsementRepository::delete);
        return endorsementRepository.countByIdSkillId(skill.getId());
    }

    @Transactional(readOnly = true)
    public List<EndorsementSummary> listForUser(UUID userId, UUID viewerId) {
        List<UserSkill> skills = userSkillRepository.findByUserIdOrderByIdAsc(userId);
        List<EndorsementSummary> out = new ArrayList<>();
        for (UserSkill s : skills) {
            long count = endorsementRepository.countByIdSkillId(s.getId());
            boolean endorsedByMe = viewerId != null
                    && endorsementRepository.existsByIdSkillIdAndIdEndorserId(s.getId(), viewerId);

            List<UUID> recentIds = endorsementRepository.findRecentEndorserIds(
                    s.getId(), PageRequest.of(0, 5));
            List<EndorsementSummary.EndorserMini> recent = new ArrayList<>();
            if (!recentIds.isEmpty()) {
                userRepository.findAllById(recentIds).forEach(u ->
                        recent.add(EndorsementSummary.EndorserMini.builder()
                                .id(u.getId())
                                .username(u.getUsername())
                                .displayName(u.getDisplayName())
                                .avatarUrl(u.getAvatarUrl())
                                .build()));
            }

            out.add(EndorsementSummary.builder()
                    .skillId(s.getId())
                    .skillName(s.getSkillName())
                    .count(count)
                    .endorsedByMe(endorsedByMe)
                    .recentEndorsers(recent)
                    .build());
        }
        return out;
    }
}
