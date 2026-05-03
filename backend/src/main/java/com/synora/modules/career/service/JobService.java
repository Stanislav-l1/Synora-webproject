package com.synora.modules.career.service;

import com.synora.modules.career.dto.*;
import com.synora.modules.career.entity.*;
import com.synora.modules.career.repository.JobApplicationRepository;
import com.synora.modules.career.repository.JobPostingRepository;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobPostingRepository jobRepository;
    private final JobApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public PageResponse<JobPostingResponse> listJobs(int page, int size, JobType type, boolean remoteOnly, UUID currentUserId) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var jobs = (type != null)
                ? jobRepository.findByStatusAndType(JobStatus.OPEN, type, pageable)
                : remoteOnly
                    ? jobRepository.findRemoteByStatus(JobStatus.OPEN, pageable)
                    : jobRepository.findByStatus(JobStatus.OPEN, pageable);
        return PageResponse.from(jobs.map(j -> toResponse(j, currentUserId)));
    }

    @Transactional
    public JobPostingResponse getJob(UUID id, UUID currentUserId) {
        JobPosting job = findOpenOrThrow(id);
        jobRepository.incrementViews(id);
        return toResponse(job, currentUserId);
    }

    @Transactional
    public JobPostingResponse createJob(User author, JobPostingRequest req) {
        var job = JobPosting.builder()
                .author(author)
                .title(req.getTitle())
                .description(req.getDescription())
                .company(req.getCompany())
                .location(req.getLocation())
                .remote(req.isRemote())
                .type(req.getType())
                .status(req.getStatus() != null ? req.getStatus() : JobStatus.OPEN)
                .salaryMin(req.getSalaryMin())
                .salaryMax(req.getSalaryMax())
                .currency(req.getCurrency() != null ? req.getCurrency() : "USD")
                .experienceYears(req.getExperienceYears())
                .applicationUrl(req.getApplicationUrl())
                .projectId(req.getProjectId())
                .skills(req.getSkills() != null ? req.getSkills() : new java.util.HashSet<>())
                .build();
        return toResponse(jobRepository.save(job), author.getId());
    }

    @Transactional
    public JobPostingResponse updateJob(UUID id, User currentUser, JobPostingRequest req) {
        JobPosting job = jobRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("JobPosting", id));
        if (!job.getAuthor().getId().equals(currentUser.getId())) {
            throw AppException.forbidden();
        }
        job.setTitle(req.getTitle());
        job.setDescription(req.getDescription());
        job.setCompany(req.getCompany());
        job.setLocation(req.getLocation());
        job.setRemote(req.isRemote());
        job.setType(req.getType());
        if (req.getStatus() != null) job.setStatus(req.getStatus());
        job.setSalaryMin(req.getSalaryMin());
        job.setSalaryMax(req.getSalaryMax());
        job.setCurrency(req.getCurrency());
        job.setExperienceYears(req.getExperienceYears());
        job.setApplicationUrl(req.getApplicationUrl());
        job.setProjectId(req.getProjectId());
        if (req.getSkills() != null) {
            job.getSkills().clear();
            job.getSkills().addAll(req.getSkills());
        }
        return toResponse(jobRepository.save(job), currentUser.getId());
    }

    @Transactional
    public void deleteJob(UUID id, User currentUser) {
        JobPosting job = jobRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("JobPosting", id));
        if (!job.getAuthor().getId().equals(currentUser.getId())) {
            throw AppException.forbidden();
        }
        jobRepository.delete(job);
    }

    @Transactional
    public JobApplicationResponse apply(UUID jobId, User applicant, JobApplicationRequest req) {
        JobPosting job = findOpenOrThrow(jobId);
        if (applicationRepository.existsByJobIdAndApplicantId(jobId, applicant.getId())) {
            throw AppException.conflict("Already applied to this job");
        }
        var application = JobApplication.builder()
                .job(job)
                .applicant(applicant)
                .coverLetter(req != null ? req.getCoverLetter() : null)
                .build();
        application = applicationRepository.save(application);
        jobRepository.incrementApplications(jobId);
        return toApplicationResponse(application);
    }

    @Transactional
    public void withdraw(UUID jobId, User applicant) {
        var app = applicationRepository.findByJobIdAndApplicantId(jobId, applicant.getId())
                .orElseThrow(() -> AppException.notFound("Application", jobId));
        applicationRepository.delete(app);
        jobRepository.decrementApplications(jobId);
    }

    @Transactional(readOnly = true)
    public PageResponse<JobApplicationResponse> getMyApplications(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(applicationRepository.findByApplicantId(userId, pageable)
                .map(this::toApplicationResponse));
    }

    @Transactional(readOnly = true)
    public PageResponse<JobApplicationResponse> getJobApplications(UUID jobId, User currentUser, int page, int size) {
        JobPosting job = jobRepository.findById(jobId)
                .orElseThrow(() -> AppException.notFound("JobPosting", jobId));
        if (!job.getAuthor().getId().equals(currentUser.getId())) {
            throw AppException.forbidden();
        }
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(applicationRepository.findByJobId(jobId, pageable)
                .map(this::toApplicationResponse));
    }

    @Transactional
    public JobApplicationResponse updateApplicationStatus(UUID applicationId, User currentUser, ApplicationStatus status) {
        var app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> AppException.notFound("Application", applicationId));
        if (!app.getJob().getAuthor().getId().equals(currentUser.getId())) {
            throw AppException.forbidden();
        }
        app.setStatus(status);
        return toApplicationResponse(applicationRepository.save(app));
    }

    @Transactional(readOnly = true)
    public PageResponse<JobPostingResponse> getMyPostings(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(jobRepository.findByAuthorId(userId, pageable)
                .map(j -> toResponse(j, userId)));
    }

    private JobPosting findOpenOrThrow(UUID id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("JobPosting", id));
    }

    private JobPostingResponse toResponse(JobPosting job, UUID currentUserId) {
        boolean applied = currentUserId != null
                && applicationRepository.existsByJobIdAndApplicantId(job.getId(), currentUserId);
        return JobPostingResponse.builder()
                .id(job.getId())
                .authorId(job.getAuthor().getId())
                .authorUsername(job.getAuthor().getUsername())
                .authorDisplayName(job.getAuthor().getDisplayName())
                .authorAvatarUrl(job.getAuthor().getAvatarUrl())
                .projectId(job.getProjectId())
                .title(job.getTitle())
                .description(job.getDescription())
                .company(job.getCompany())
                .location(job.getLocation())
                .remote(job.isRemote())
                .type(job.getType())
                .status(job.getStatus())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .currency(job.getCurrency())
                .experienceYears(job.getExperienceYears())
                .applicationUrl(job.getApplicationUrl())
                .applicationsCount(job.getApplicationsCount())
                .viewsCount(job.getViewsCount())
                .skills(job.getSkills())
                .applied(applied)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }

    private JobApplicationResponse toApplicationResponse(JobApplication app) {
        return JobApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .applicantId(app.getApplicant().getId())
                .applicantUsername(app.getApplicant().getUsername())
                .applicantDisplayName(app.getApplicant().getDisplayName())
                .applicantAvatarUrl(app.getApplicant().getAvatarUrl())
                .coverLetter(app.getCoverLetter())
                .status(app.getStatus())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
