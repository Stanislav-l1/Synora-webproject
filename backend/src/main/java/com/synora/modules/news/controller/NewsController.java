package com.synora.modules.news.controller;

import com.synora.modules.news.dto.NewsItemResponse;
import com.synora.modules.news.service.NewsService;
import com.synora.shared.dto.ApiResponse;
import com.synora.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "News", description = "Curated news feed")
@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @Operation(summary = "List news items, optionally filtered by tag")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NewsItemResponse>>> list(
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(newsService.list(tag, page, size)));
    }
}
