package com.synora.modules.post.controller;

import com.synora.modules.post.dto.TagResponse;
import com.synora.modules.post.service.TagService;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Tags", description = "Tag management")
@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @Operation(summary = "Get all tags sorted by usage")
    @GetMapping
    public ResponseEntity<ApiResponse<List<TagResponse>>> getAllTags() {
        return ResponseEntity.ok(ApiResponse.ok(tagService.getAllTags()));
    }

    @Operation(summary = "Search tags by name")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TagResponse>>> searchTags(
            @RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok(tagService.searchTags(q)));
    }

    @Operation(summary = "Top trending tags by usage")
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<java.util.Map<String, Object>>>> trending(
            @RequestParam(defaultValue = "5") int limit) {
        int capped = Math.max(1, Math.min(limit, 50));
        List<java.util.Map<String, Object>> result = tagService.getAllTags().stream()
                .limit(capped)
                .map(t -> {
                    java.util.Map<String, Object> m = new java.util.HashMap<>();
                    m.put("tag", t.getName());
                    m.put("posts", t.getUsageCount());
                    return m;
                })
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
