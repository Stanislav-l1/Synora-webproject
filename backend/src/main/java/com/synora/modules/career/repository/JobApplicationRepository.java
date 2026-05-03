package com.synora.modules.career.repository;

import com.synora.modules.career.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {

    Page<JobApplication> findByJobId(UUID jobId, Pageable pageable);

    Page<JobApplication> findByApplicantId(UUID applicantId, Pageable pageable);

    Optional<JobApplication> findByJobIdAndApplicantId(UUID jobId, UUID applicantId);

    boolean existsByJobIdAndApplicantId(UUID jobId, UUID applicantId);
}
