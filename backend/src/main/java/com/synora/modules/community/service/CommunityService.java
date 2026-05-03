package com.synora.modules.community.service;

import com.synora.modules.community.dto.*;
import com.synora.modules.community.entity.*;
import com.synora.modules.community.repository.CommunityMemberRepository;
import com.synora.modules.community.repository.CommunityRepository;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository       communityRepository;
    private final CommunityMemberRepository memberRepository;

    @Transactional(readOnly = true)
    public PageResponse<CommunityResponse> listPublic(int page, int size, String q, UUID currentUserId) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "membersCount"));
        var communities = (q != null && !q.isBlank())
                ? communityRepository.searchPublic(q.trim(), pageable)
                : communityRepository.findByPrivacyNot(CommunityPrivacy.PRIVATE, pageable);
        return PageResponse.from(communities.map(c -> toResponse(c, currentUserId)));
    }

    @Transactional(readOnly = true)
    public PageResponse<CommunityResponse> myJoined(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "community.createdAt"));
        return PageResponse.from(
                communityRepository.findByMember(userId, pageable).map(c -> toResponse(c, userId))
        );
    }

    @Transactional(readOnly = true)
    public CommunityResponse getBySlug(String slug, UUID currentUserId) {
        Community c = findBySlugOrThrow(slug);
        return toResponse(c, currentUserId);
    }

    @Transactional
    public CommunityResponse create(User owner, CreateCommunityRequest req) {
        String slug = slugify(req.getName());
        if (communityRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 6);
        }
        if (communityRepository.existsByName(req.getName())) {
            throw AppException.conflict("Community name already taken");
        }
        var community = Community.builder()
                .name(req.getName())
                .slug(slug)
                .description(req.getDescription())
                .avatarUrl(req.getAvatarUrl())
                .bannerUrl(req.getBannerUrl())
                .privacy(req.getPrivacy() != null ? req.getPrivacy() : CommunityPrivacy.PUBLIC)
                .owner(owner)
                .build();
        community = communityRepository.save(community);

        var membership = CommunityMember.builder()
                .id(new CommunityMemberId(community.getId(), owner.getId()))
                .community(community)
                .user(owner)
                .role(CommunityRole.OWNER)
                .build();
        memberRepository.save(membership);

        return toResponse(community, owner.getId());
    }

    @Transactional
    public CommunityResponse update(String slug, User currentUser, UpdateCommunityRequest req) {
        Community c = findBySlugOrThrow(slug);
        assertOwnerOrModerator(c, currentUser);

        if (req.getName() != null && !req.getName().equals(c.getName())) {
            if (communityRepository.existsByName(req.getName())) {
                throw AppException.conflict("Community name already taken");
            }
            c.setName(req.getName());
        }
        if (req.getDescription() != null) c.setDescription(req.getDescription());
        if (req.getAvatarUrl()   != null) c.setAvatarUrl(req.getAvatarUrl());
        if (req.getBannerUrl()   != null) c.setBannerUrl(req.getBannerUrl());
        if (req.getPrivacy()     != null) c.setPrivacy(req.getPrivacy());

        return toResponse(communityRepository.save(c), currentUser.getId());
    }

    @Transactional
    public void delete(String slug, User currentUser) {
        Community c = findBySlugOrThrow(slug);
        if (!c.getOwner().getId().equals(currentUser.getId())) {
            throw AppException.forbidden();
        }
        communityRepository.delete(c);
    }

    @Transactional
    public CommunityResponse join(String slug, User user) {
        Community c = findBySlugOrThrow(slug);
        if (c.getPrivacy() == CommunityPrivacy.PRIVATE) {
            throw AppException.forbidden();
        }
        if (memberRepository.existsByIdCommunityIdAndIdUserId(c.getId(), user.getId())) {
            throw AppException.conflict("Already a member");
        }
        var membership = CommunityMember.builder()
                .id(new CommunityMemberId(c.getId(), user.getId()))
                .community(c)
                .user(user)
                .role(CommunityRole.MEMBER)
                .build();
        memberRepository.save(membership);
        communityRepository.incrementMembers(c.getId());
        c.setMembersCount(c.getMembersCount() + 1);
        return toResponse(c, user.getId());
    }

    @Transactional
    public void leave(String slug, User user) {
        Community c = findBySlugOrThrow(slug);
        if (c.getOwner().getId().equals(user.getId())) {
            throw AppException.badRequest("Owner cannot leave — delete the community instead");
        }
        var member = memberRepository.findByIdCommunityIdAndIdUserId(c.getId(), user.getId())
                .orElseThrow(() -> AppException.notFound("Membership", c.getId()));
        memberRepository.delete(member);
        communityRepository.decrementMembers(c.getId());
    }

    @Transactional(readOnly = true)
    public PageResponse<CommunityMemberResponse> getMembers(String slug, int page, int size) {
        Community c = findBySlugOrThrow(slug);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "joinedAt"));
        return PageResponse.from(
                memberRepository.findByIdCommunityId(c.getId(), pageable)
                        .map(this::toMemberResponse)
        );
    }

    // ---- helpers ----

    private Community findBySlugOrThrow(String slug) {
        return communityRepository.findBySlug(slug)
                .orElseThrow(() -> AppException.notFound("Community", slug));
    }

    private void assertOwnerOrModerator(Community c, User user) {
        var role = memberRepository.findRoleByIdCommunityIdAndIdUserId(c.getId(), user.getId())
                .orElse(null);
        if (role == null || (role != CommunityRole.OWNER && role != CommunityRole.MODERATOR)) {
            throw AppException.forbidden();
        }
    }

    private CommunityResponse toResponse(Community c, UUID currentUserId) {
        boolean isMember = currentUserId != null
                && memberRepository.existsByIdCommunityIdAndIdUserId(c.getId(), currentUserId);
        CommunityRole myRole = currentUserId != null
                ? memberRepository.findRoleByIdCommunityIdAndIdUserId(c.getId(), currentUserId).orElse(null)
                : null;

        return CommunityResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .avatarUrl(c.getAvatarUrl())
                .bannerUrl(c.getBannerUrl())
                .privacy(c.getPrivacy())
                .ownerId(c.getOwner().getId())
                .ownerUsername(c.getOwner().getUsername())
                .ownerDisplayName(c.getOwner().getDisplayName())
                .ownerAvatarUrl(c.getOwner().getAvatarUrl())
                .membersCount(c.getMembersCount())
                .postsCount(c.getPostsCount())
                .member(isMember)
                .myRole(myRole)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private CommunityMemberResponse toMemberResponse(CommunityMember m) {
        var u = m.getUser();
        return CommunityMemberResponse.builder()
                .userId(u.getId())
                .username(u.getUsername())
                .displayName(u.getDisplayName())
                .avatarUrl(u.getAvatarUrl())
                .role(m.getRole())
                .joinedAt(m.getJoinedAt())
                .build();
    }

    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9]+");

    private String slugify(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return NON_ALPHANUMERIC.matcher(normalized.toLowerCase()).replaceAll("-")
                .replaceAll("^-|-$", "");
    }
}
