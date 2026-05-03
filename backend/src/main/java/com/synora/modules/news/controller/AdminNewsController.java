package com.synora.modules.news.controller;

import com.synora.modules.news.dto.CreateNewsRequest;
import com.synora.modules.news.dto.NewsItemResponse;
import com.synora.modules.news.service.NewsService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
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

@Tag(name = "Admin: News", description = "Curate news (admin only)")
@RestController
@RequestMapping("/api/v1/admin/news")
@RequiredArgsConstructor
public class AdminNewsController {

    private final NewsService newsService;

    @Operation(summary = "Create a news item",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<ApiResponse<NewsItemResponse>> create(
            @AuthenticationPrincipal User admin,
            @Valid @RequestBody CreateNewsRequest req) {
        NewsItemResponse out = newsService.create(admin, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("News created", out));
    }

    @Operation(summary = "Delete a news item",
            security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        newsService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("News deleted", null));
    }
}
