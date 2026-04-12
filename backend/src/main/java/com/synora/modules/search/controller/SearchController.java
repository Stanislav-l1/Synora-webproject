package com.synora.modules.search.controller;

import com.synora.modules.search.service.SearchService;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Tag(name = "Search")
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/posts")
    @Operation(summary = "Search posts by title/content")
    public ResponseEntity<?> searchPosts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                searchService.searchPosts(q, page, size)));
    }

    @GetMapping("/projects")
    @Operation(summary = "Search projects by name/description")
    public ResponseEntity<?> searchProjects(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                searchService.searchProjects(q, page, size)));
    }

    @GetMapping("/users")
    @Operation(summary = "Search users by username/display name")
    public ResponseEntity<?> searchUsers(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                searchService.searchUsers(q, page, size)));
    }
}
