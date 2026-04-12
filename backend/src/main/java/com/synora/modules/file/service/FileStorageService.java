package com.synora.modules.file.service;

import com.synora.modules.file.dto.FileUploadResponse;
import com.synora.modules.file.entity.FileUpload;
import com.synora.modules.file.repository.FileUploadRepository;
import com.synora.modules.user.entity.User;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final FileUploadRepository fileRepository;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Transactional
    public FileUploadResponse upload(User uploader, MultipartFile file,
                                     UUID entityId, String entityType) {
        if (file.isEmpty()) {
            throw AppException.badRequest("File is empty");
        }

        String s3Key = buildS3Key(entityType, file.getOriginalFilename());

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw AppException.badRequest("Failed to upload file: " + e.getMessage());
        }

        FileUpload fileUpload = FileUpload.builder()
                .uploader(uploader)
                .s3Key(s3Key)
                .originalName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .sizeBytes(file.getSize())
                .entityId(entityId)
                .entityType(entityType)
                .build();

        return toResponse(fileRepository.save(fileUpload));
    }

    @Transactional(readOnly = true)
    public FileUploadResponse getFile(UUID fileId) {
        FileUpload file = fileRepository.findById(fileId)
                .orElseThrow(() -> AppException.notFound("File", fileId));
        return toResponse(file);
    }

    @Transactional(readOnly = true)
    public List<FileUploadResponse> getByEntity(UUID entityId, String entityType) {
        return fileRepository.findByEntityIdAndEntityType(entityId, entityType)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void deleteFile(UUID fileId, User currentUser) {
        FileUpload file = fileRepository.findById(fileId)
                .orElseThrow(() -> AppException.notFound("File", fileId));

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!file.getUploader().getId().equals(currentUser.getId()) && !isAdmin) {
            throw AppException.forbidden();
        }

        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(file.getS3Key())
                .build());

        fileRepository.delete(file);
    }

    @Transactional(readOnly = true)
    public String getPresignedUrl(UUID fileId) {
        FileUpload file = fileRepository.findById(fileId)
                .orElseThrow(() -> AppException.notFound("File", fileId));
        return generatePresignedUrl(file.getS3Key());
    }

    private String generatePresignedUrl(String s3Key) {
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(1))
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(bucket)
                        .key(s3Key)
                        .build())
                .build();
        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    private String buildS3Key(String entityType, String originalName) {
        String folder = entityType != null ? entityType.toLowerCase() : "general";
        String safeName = originalName != null
                ? originalName.replaceAll("[^a-zA-Z0-9._-]", "_")
                : "file";
        return folder + "/" + UUID.randomUUID() + "_" + safeName;
    }

    private FileUploadResponse toResponse(FileUpload f) {
        return FileUploadResponse.builder()
                .id(f.getId())
                .originalName(f.getOriginalName())
                .mimeType(f.getMimeType())
                .sizeBytes(f.getSizeBytes())
                .url(generatePresignedUrl(f.getS3Key()))
                .entityId(f.getEntityId())
                .entityType(f.getEntityType())
                .isPublic(f.isPublic())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
