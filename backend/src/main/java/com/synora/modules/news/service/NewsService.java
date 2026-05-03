package com.synora.modules.news.service;

import com.synora.modules.news.dto.CreateNewsRequest;
import com.synora.modules.news.dto.NewsItemResponse;
import com.synora.modules.news.entity.NewsItem;
import com.synora.modules.news.repository.NewsItemRepository;
import com.synora.modules.post.entity.Tag;
import com.synora.modules.post.repository.TagRepository;
import com.synora.modules.user.entity.User;
import com.synora.shared.dto.PageResponse;
import com.synora.shared.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsItemRepository newsItemRepository;
    private final TagRepository tagRepository;

    @Transactional(readOnly = true)
    public PageResponse<NewsItemResponse> list(String tagName, int page, int size) {
        var pageable = PageRequest.of(page, Math.min(size, 50));
        Page<NewsItem> items;
        if (tagName != null && !tagName.isBlank()) {
            Tag tag = tagRepository.findByName(tagName)
                    .orElseThrow(() -> AppException.notFound("Tag", tagName));
            items = newsItemRepository.findByTagId(tag.getId(), pageable);
        } else {
            items = newsItemRepository.findAllOrderByPublishedAtDesc(pageable);
        }
        return PageResponse.from(items.map(this::toResponse));
    }

    @Transactional
    public NewsItemResponse create(User admin, CreateNewsRequest req) {
        Set<Tag> tags = resolveTags(req.getTags());
        NewsItem item = NewsItem.builder()
                .title(req.getTitle().trim())
                .summary(req.getSummary())
                .url(req.getUrl())
                .source(req.getSource())
                .imageUrl(req.getImageUrl())
                .publishedAt(req.getPublishedAt() != null ? req.getPublishedAt() : Instant.now())
                .createdBy(admin)
                .tags(tags)
                .build();
        return toResponse(newsItemRepository.save(item));
    }

    @Transactional
    public void delete(UUID id) {
        if (!newsItemRepository.existsById(id)) {
            throw AppException.notFound("NewsItem", id);
        }
        newsItemRepository.deleteById(id);
    }

    private Set<Tag> resolveTags(List<String> names) {
        Set<Tag> out = new HashSet<>();
        if (names == null) return out;
        for (String raw : names) {
            if (raw == null) continue;
            String name = raw.trim();
            if (name.isEmpty()) continue;
            Tag t = tagRepository.findByName(name).orElseGet(() ->
                    tagRepository.save(Tag.builder().name(name).build()));
            out.add(t);
        }
        return out;
    }

    private NewsItemResponse toResponse(NewsItem n) {
        return NewsItemResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .summary(n.getSummary())
                .url(n.getUrl())
                .source(n.getSource())
                .imageUrl(n.getImageUrl())
                .publishedAt(n.getPublishedAt())
                .tags(n.getTags() == null ? List.of()
                        : n.getTags().stream().map(Tag::getName).toList())
                .build();
    }
}
