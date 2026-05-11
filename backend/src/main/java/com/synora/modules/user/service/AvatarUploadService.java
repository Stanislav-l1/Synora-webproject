package com.synora.modules.user.service;

import com.synora.modules.user.entity.User;
import com.synora.modules.user.repository.UserRepository;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AvatarUploadService {

    private static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_MIME = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");

    private final S3Client s3Client;
    private final UserRepository userRepository;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.public-base-url:/files/public}")
    private String publicBaseUrl;

    @CacheEvict(value = "users", allEntries = true)
    @Transactional
    public String upload(User currentUser, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw AppException.badRequest("File is empty");
        }
        if (file.getSize() > MAX_BYTES) {
            throw AppException.badRequest("Avatar must be 5MB or smaller");
        }
        String mime = file.getContentType();
        if (mime == null || !ALLOWED_MIME.contains(mime)) {
            throw AppException.badRequest("Unsupported image type");
        }

        String ext = switch (mime) {
            case "image/jpeg" -> "jpg";
            case "image/png"  -> "png";
            case "image/webp" -> "webp";
            case "image/gif"  -> "gif";
            default -> "bin";
        };
        // Cache-bust by including a fresh suffix on every upload
        String s3Key = "public/avatars/" + currentUser.getId() + "_" + UUID.randomUUID() + "." + ext;

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(s3Key)
                            .contentType(mime)
                            .cacheControl("public, max-age=86400")
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw AppException.badRequest("Failed to upload avatar: " + e.getMessage());
        }

        String publicUrl = publicBaseUrl.replaceAll("/+$", "")
                + "/" + s3Key.substring("public/".length());

        currentUser.setAvatarUrl(publicUrl);
        userRepository.save(currentUser);

        return publicUrl;
    }
}
