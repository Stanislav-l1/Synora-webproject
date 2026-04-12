package com.synora.modules.post.service;

import com.synora.modules.post.dto.TagResponse;
import com.synora.modules.post.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    @Cacheable("tags")
    @Transactional(readOnly = true)
    public List<TagResponse> getAllTags() {
        return tagRepository.findAllByOrderByUsageCountDesc()
                .stream().map(t -> TagResponse.builder()
                        .id(t.getId()).name(t.getName())
                        .color(t.getColor()).usageCount(t.getUsageCount())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TagResponse> searchTags(String query) {
        return tagRepository.findByNameContainingIgnoreCaseOrderByUsageCountDesc(query)
                .stream().map(t -> TagResponse.builder()
                        .id(t.getId()).name(t.getName())
                        .color(t.getColor()).usageCount(t.getUsageCount())
                        .build())
                .toList();
    }
}
