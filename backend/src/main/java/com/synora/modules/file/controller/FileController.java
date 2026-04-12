package com.synora.modules.file.controller;

import com.synora.modules.file.service.FileStorageService;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "Files")
@SecurityRequirement(name = "bearerAuth")
public class FileController {

    private final FileStorageService fileService;

    @PostMapping("/upload")
    @Operation(summary = "Upload a file")
    public ResponseEntity<?> upload(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) UUID entityId,
            @RequestParam(required = false) String entityType) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(fileService.upload(currentUser, file, entityId, entityType)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get file metadata")
    public ResponseEntity<?> getFile(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(fileService.getFile(id)));
    }

    @GetMapping("/{id}/url")
    @Operation(summary = "Get presigned download URL")
    public ResponseEntity<?> getUrl(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(
                java.util.Map.of("url", fileService.getPresignedUrl(id))));
    }

    @GetMapping("/by-entity")
    @Operation(summary = "Get files attached to an entity")
    public ResponseEntity<?> getByEntity(
            @RequestParam UUID entityId,
            @RequestParam String entityType) {
        return ResponseEntity.ok(ApiResponse.ok(
                fileService.getByEntity(entityId, entityType)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a file")
    public ResponseEntity<?> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        fileService.deleteFile(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("File deleted", null));
    }
}
