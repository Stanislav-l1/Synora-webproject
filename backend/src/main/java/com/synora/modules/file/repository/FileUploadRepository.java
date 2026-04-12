package com.synora.modules.file.repository;

import com.synora.modules.file.entity.FileUpload;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FileUploadRepository extends JpaRepository<FileUpload, UUID> {

    Page<FileUpload> findByUploaderId(UUID uploaderId, Pageable pageable);

    List<FileUpload> findByEntityIdAndEntityType(UUID entityId, String entityType);

    Optional<FileUpload> findByS3Key(String s3Key);
}
