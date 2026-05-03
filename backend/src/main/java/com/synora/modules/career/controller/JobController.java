package com.synora.modules.career.controller;

import com.synora.modules.career.dto.*;
import com.synora.modules.career.entity.ApplicationStatus;
import com.synora.modules.career.entity.JobType;
import com.synora.modules.career.service.JobService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
import com.synora.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Career", description = "Job postings, internships, freelance and team search")
@RestController
@RequestMapping("/api/v1/career")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @Operation(summary = "List open job postings")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<JobPostingResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) JobType type,
            @RequestParam(defaultValue = "false") boolean remote,
            @AuthenticationPrincipal User currentUser) {

        UUID uid = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(jobService.listJobs(page, size, type, remote, uid)));
    }

    @Operation(summary = "Get job posting by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobPostingResponse>> getJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        UUID uid = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(jobService.getJob(id, uid)));
    }

    @Operation(summary = "Create job posting", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<ApiResponse<JobPostingResponse>> create(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody JobPostingRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(jobService.createJob(currentUser, req)));
    }

    @Operation(summary = "Update job posting", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JobPostingResponse>> update(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody JobPostingRequest req) {

        return ResponseEntity.ok(ApiResponse.ok(jobService.updateJob(id, currentUser, req)));
    }

    @Operation(summary = "Delete job posting", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        jobService.deleteJob(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "Apply to job", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{id}/apply")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> apply(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody(required = false) JobApplicationRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(jobService.apply(id, currentUser, req)));
    }

    @Operation(summary = "Withdraw application", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}/apply")
    public ResponseEntity<ApiResponse<Void>> withdraw(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {

        jobService.withdraw(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "List applications for a job (owner only)", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/{id}/applications")
    public ResponseEntity<ApiResponse<PageResponse<JobApplicationResponse>>> getApplications(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(jobService.getJobApplications(id, currentUser, page, size)));
    }

    @Operation(summary = "My applications", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/my/applications")
    public ResponseEntity<ApiResponse<PageResponse<JobApplicationResponse>>> myApplications(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(jobService.getMyApplications(currentUser.getId(), page, size)));
    }

    @Operation(summary = "Update application status (owner only)", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/applications/{appId}/status")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> updateApplicationStatus(
            @PathVariable UUID appId,
            @AuthenticationPrincipal User currentUser,
            @RequestParam ApplicationStatus status) {

        return ResponseEntity.ok(ApiResponse.ok(jobService.updateApplicationStatus(appId, currentUser, status)));
    }

    @Operation(summary = "My job postings", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/my/postings")
    public ResponseEntity<ApiResponse<PageResponse<JobPostingResponse>>> myPostings(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.ok(jobService.getMyPostings(currentUser.getId(), page, size)));
    }
}
