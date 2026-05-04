package com.synora.modules.career.repository;

import com.synora.modules.career.entity.JobSave;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface JobSaveRepository extends JpaRepository<JobSave, JobSave.JobSaveId> {

    boolean existsByIdUserIdAndIdJobId(UUID userId, UUID jobId);

    void deleteByIdUserIdAndIdJobId(UUID userId, UUID jobId);

    Page<JobSave> findByIdUserId(UUID userId, Pageable pageable);
}
