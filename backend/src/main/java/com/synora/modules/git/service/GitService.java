package com.synora.modules.git.service;

import com.synora.modules.git.dto.*;
import com.synora.modules.git.entity.*;
import com.synora.modules.git.repository.ContributionDataRepository;
import com.synora.modules.git.repository.GitRepoRepository;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GitService {

    private final GitRepoRepository repoRepository;
    private final ContributionDataRepository contributionRepository;

    @Transactional(readOnly = true)
    public List<GitRepoResponse> getUserRepos(UUID userId) {
        return repoRepository.findByUserIdOrderByStarsDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<GitRepoResponse> getUserReposPaged(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "starsCount"));
        return PageResponse.from(repoRepository.findByUserId(userId, pageable).map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public List<GitRepoResponse> getFeaturedRepos(UUID userId) {
        return repoRepository.findFeaturedByUserId(userId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public GitRepoResponse importRepo(User user, ImportRepoRequest req) {
        if (repoRepository.existsByUserIdAndProviderAndExternalId(user.getId(), req.getProvider(), req.getExternalId())) {
            throw AppException.conflict("Repository already imported");
        }
        var repo = GitRepo.builder()
                .user(user)
                .provider(req.getProvider())
                .externalId(req.getExternalId())
                .name(req.getName())
                .fullName(req.getFullName())
                .description(req.getDescription())
                .url(req.getUrl())
                .homepageUrl(req.getHomepageUrl())
                .language(req.getLanguage())
                .topics(req.getTopics() != null ? req.getTopics() : new java.util.ArrayList<>())
                .starsCount(req.getStarsCount())
                .forksCount(req.getForksCount())
                .watchersCount(req.getWatchersCount())
                .openIssues(req.getOpenIssues())
                .privateRepo(req.isPrivateRepo())
                .fork(req.isFork())
                .lastPushedAt(req.getLastPushedAt())
                .syncedAt(Instant.now())
                .build();
        return toResponse(repoRepository.save(repo));
    }

    @Transactional
    public GitRepoResponse syncRepo(UUID repoId, User user, ImportRepoRequest req) {
        GitRepo repo = repoRepository.findById(repoId)
                .orElseThrow(() -> AppException.notFound("GitRepo", repoId));
        if (!repo.getUser().getId().equals(user.getId())) {
            throw AppException.forbidden();
        }
        repo.setDescription(req.getDescription());
        repo.setHomepageUrl(req.getHomepageUrl());
        repo.setLanguage(req.getLanguage());
        if (req.getTopics() != null) repo.setTopics(req.getTopics());
        repo.setStarsCount(req.getStarsCount());
        repo.setForksCount(req.getForksCount());
        repo.setWatchersCount(req.getWatchersCount());
        repo.setOpenIssues(req.getOpenIssues());
        repo.setLastPushedAt(req.getLastPushedAt());
        repo.setSyncedAt(Instant.now());
        return toResponse(repoRepository.save(repo));
    }

    @Transactional
    public GitRepoResponse toggleFeatured(UUID repoId, User user) {
        GitRepo repo = repoRepository.findById(repoId)
                .orElseThrow(() -> AppException.notFound("GitRepo", repoId));
        if (!repo.getUser().getId().equals(user.getId())) {
            throw AppException.forbidden();
        }
        repo.setFeatured(!repo.isFeatured());
        return toResponse(repoRepository.save(repo));
    }

    @Transactional
    public void deleteRepo(UUID repoId, User user) {
        GitRepo repo = repoRepository.findById(repoId)
                .orElseThrow(() -> AppException.notFound("GitRepo", repoId));
        if (!repo.getUser().getId().equals(user.getId())) {
            throw AppException.forbidden();
        }
        repoRepository.delete(repo);
    }

    @Transactional
    public ContributionDataResponse saveContributions(User user, GitProvider provider, short year, Map<String, Integer> data) {
        var existing = contributionRepository.findByUserIdAndProviderAndYear(user.getId(), provider, year);
        ContributionData entry;
        if (existing.isPresent()) {
            entry = existing.get();
            entry.setData(data);
            entry.setSyncedAt(Instant.now());
        } else {
            entry = ContributionData.builder()
                    .user(user)
                    .provider(provider)
                    .year(year)
                    .data(data)
                    .syncedAt(Instant.now())
                    .build();
        }
        return toContribResponse(contributionRepository.save(entry));
    }

    @Transactional(readOnly = true)
    public List<ContributionDataResponse> getContributions(UUID userId) {
        return contributionRepository.findByUserId(userId)
                .stream().map(this::toContribResponse).toList();
    }

    private GitRepoResponse toResponse(GitRepo repo) {
        return GitRepoResponse.builder()
                .id(repo.getId())
                .userId(repo.getUser().getId())
                .provider(repo.getProvider())
                .externalId(repo.getExternalId())
                .name(repo.getName())
                .fullName(repo.getFullName())
                .description(repo.getDescription())
                .url(repo.getUrl())
                .homepageUrl(repo.getHomepageUrl())
                .language(repo.getLanguage())
                .topics(repo.getTopics())
                .starsCount(repo.getStarsCount())
                .forksCount(repo.getForksCount())
                .watchersCount(repo.getWatchersCount())
                .openIssues(repo.getOpenIssues())
                .privateRepo(repo.isPrivateRepo())
                .fork(repo.isFork())
                .featured(repo.isFeatured())
                .lastPushedAt(repo.getLastPushedAt())
                .syncedAt(repo.getSyncedAt())
                .createdAt(repo.getCreatedAt())
                .build();
    }

    private ContributionDataResponse toContribResponse(ContributionData cd) {
        return ContributionDataResponse.builder()
                .id(cd.getId())
                .userId(cd.getUser().getId())
                .provider(cd.getProvider())
                .year(cd.getYear())
                .data(cd.getData())
                .syncedAt(cd.getSyncedAt())
                .build();
    }
}
