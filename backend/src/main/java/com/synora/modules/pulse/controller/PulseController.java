package com.synora.modules.pulse.controller;

import com.synora.modules.pulse.dto.PulseEntryResponse;
import com.synora.modules.pulse.service.PulseService;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pulse")
@RequiredArgsConstructor
@Tag(name = "Pulse", description = "Public live activity feed")
public class PulseController {

    private final PulseService pulseService;

    @GetMapping("/recent")
    @Operation(summary = "Recent activity across posts, projects and follows")
    public ResponseEntity<ApiResponse<List<PulseEntryResponse>>> recent(
            @RequestParam(defaultValue = "30") int limit) {
        int capped = Math.max(1, Math.min(limit, 100));
        return ResponseEntity.ok(ApiResponse.ok(pulseService.recent(capped)));
    }
}
