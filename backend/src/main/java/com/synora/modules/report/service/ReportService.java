package com.synora.modules.report.service;

import com.synora.modules.report.dto.CreateReportRequest;
import com.synora.modules.report.dto.ReportResponse;
import com.synora.modules.report.entity.Report;
import com.synora.modules.report.entity.ReportStatus;
import com.synora.modules.report.entity.ReportType;
import com.synora.modules.report.repository.ReportRepository;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;

    @Transactional
    public ReportResponse createReport(User reporter, CreateReportRequest req) {
        ReportType type;
        try {
            type = ReportType.valueOf(req.getEntityType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw AppException.badRequest("Invalid entity type: " + req.getEntityType());
        }

        if (reportRepository.existsByReporterIdAndEntityIdAndEntityType(
                reporter.getId(), req.getEntityId(), type)) {
            throw AppException.conflict("You already reported this entity");
        }

        Report report = Report.builder()
                .reporter(reporter)
                .entityId(req.getEntityId())
                .entityType(type)
                .reason(req.getReason())
                .description(req.getDescription())
                .build();

        return toResponse(reportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportResponse> getAllReports(int page, int size) {
        var pageable = PageRequest.of(page, size);
        return PageResponse.from(
                reportRepository.findAllByOrderByCreatedAtDesc(pageable)
                        .map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportResponse> getReportsByStatus(ReportStatus status, int page, int size) {
        var pageable = PageRequest.of(page, size);
        return PageResponse.from(
                reportRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                        .map(this::toResponse));
    }

    @Transactional
    public ReportResponse reviewReport(Long reportId, User reviewer, ReportStatus newStatus) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> AppException.notFound("Report", reportId));

        report.setStatus(newStatus);
        report.setReviewer(reviewer);
        report.setReviewedAt(Instant.now());

        return toResponse(reportRepository.save(report));
    }

    private ReportResponse toResponse(Report r) {
        var builder = ReportResponse.builder()
                .id(r.getId())
                .reporterId(r.getReporter().getId())
                .reporterUsername(r.getReporter().getUsername())
                .entityId(r.getEntityId())
                .entityType(r.getEntityType().name())
                .reason(r.getReason())
                .description(r.getDescription())
                .status(r.getStatus().name())
                .createdAt(r.getCreatedAt());

        if (r.getReviewer() != null) {
            builder.reviewerId(r.getReviewer().getId())
                    .reviewerUsername(r.getReviewer().getUsername())
                    .reviewedAt(r.getReviewedAt());
        }

        return builder.build();
    }
}
