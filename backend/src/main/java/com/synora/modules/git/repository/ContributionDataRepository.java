package com.synora.modules.git.repository;

import com.synora.modules.git.entity.ContributionData;
import com.synora.modules.git.entity.GitProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContributionDataRepository extends JpaRepository<ContributionData, UUID> {

    List<ContributionData> findByUserId(UUID userId);

    Optional<ContributionData> findByUserIdAndProviderAndYear(UUID userId, GitProvider provider, short year);

    List<ContributionData> findByUserIdAndProvider(UUID userId, GitProvider provider);
}
