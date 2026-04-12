package com.synora.modules.reputation.controller;

import com.synora.modules.reputation.service.ReputationService;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/{userId}/reputation")
@RequiredArgsConstructor
@Tag(name = "Reputation")
public class ReputationController {

    private final ReputationService reputationService;

    @GetMapping
    @Operation(summary = "Get user reputation score")
    public ResponseEntity<?> getScore(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "score", reputationService.getScore(userId))));
    }

    @GetMapping("/history")
    @Operation(summary = "Get user reputation history")
    public ResponseEntity<?> getHistory(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                reputationService.getHistory(userId, page, size)));
    }
}
