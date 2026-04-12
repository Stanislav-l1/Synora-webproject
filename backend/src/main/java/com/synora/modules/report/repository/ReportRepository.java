package com.synora.modules.report.repository;

import com.synora.modules.report.entity.Report;
import com.synora.modules.report.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    Page<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);

    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);

    boolean existsByReporterIdAndEntityIdAndEntityType(
            UUID reporterId, UUID entityId,
            com.synora.modules.report.entity.ReportType entityType);
}
