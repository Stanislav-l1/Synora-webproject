package com.synora.modules.career.repository;

import com.synora.modules.career.entity.JobPosting;
import com.synora.modules.career.entity.JobStatus;
import com.synora.modules.career.entity.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface JobPostingRepository extends JpaRepository<JobPosting, UUID> {

    Page<JobPosting> findByStatus(JobStatus status, Pageable pageable);

    Page<JobPosting> findByStatusAndType(JobStatus status, JobType type, Pageable pageable);

    @Query("SELECT j FROM JobPosting j WHERE j.status = :status AND j.remote = true")
    Page<JobPosting> findRemoteByStatus(@Param("status") JobStatus status, Pageable pageable);

    Page<JobPosting> findByAuthorId(UUID authorId, Pageable pageable);

    @Query("""
            SELECT j FROM JobPosting j WHERE j.status = :status
            AND (LOWER(j.title) LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(j.description) LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(COALESCE(j.company, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<JobPosting> searchByKeyword(@Param("status") JobStatus status,
                                     @Param("q") String q,
                                     Pageable pageable);

    @Query("""
            SELECT j FROM JobPosting j WHERE j.status = :status AND j.remote = true
            AND (LOWER(j.title) LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(j.description) LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(COALESCE(j.company, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<JobPosting> searchRemoteByKeyword(@Param("status") JobStatus status,
                                            @Param("q") String q,
                                            Pageable pageable);

    @Query("""
            SELECT j FROM JobPosting j WHERE j.status = :status AND j.type = :type
            AND (LOWER(j.title) LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(j.description) LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(COALESCE(j.company, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<JobPosting> searchByTypeAndKeyword(@Param("status") JobStatus status,
                                             @Param("type") JobType type,
                                             @Param("q") String q,
                                             Pageable pageable);

    @Modifying
    @Query("UPDATE JobPosting j SET j.viewsCount = j.viewsCount + 1 WHERE j.id = :id")
    void incrementViews(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE JobPosting j SET j.applicationsCount = j.applicationsCount + 1 WHERE j.id = :id")
    void incrementApplications(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE JobPosting j SET j.applicationsCount = j.applicationsCount - 1 WHERE j.id = :id AND j.applicationsCount > 0")
    void decrementApplications(@Param("id") UUID id);
}
