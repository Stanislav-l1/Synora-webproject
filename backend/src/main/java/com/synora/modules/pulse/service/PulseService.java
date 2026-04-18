package com.synora.modules.pulse.service;

import com.synora.modules.post.entity.Post;
import com.synora.modules.post.repository.PostRepository;
import com.synora.modules.project.entity.Project;
import com.synora.modules.project.repository.ProjectRepository;
import com.synora.modules.pulse.dto.PulseEntryResponse;
import com.synora.modules.user.entity.UserFollow;
import com.synora.modules.user.repository.UserFollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PulseService {

    private final PostRepository postRepository;
    private final ProjectRepository projectRepository;
    private final UserFollowRepository userFollowRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "pulse", key = "#limit")
    public List<PulseEntryResponse> recent(int limit) {
        int perSource = Math.max(1, limit);
        List<PulseEntryResponse> merged = new ArrayList<>();

        var recentPosts = postRepository.findAll(
                PageRequest.of(0, perSource, Sort.by(Sort.Direction.DESC, "createdAt")));
        for (Post p : recentPosts) {
            merged.add(PulseEntryResponse.builder()
                    .type("post")
                    .actor(p.getAuthor() != null ? p.getAuthor().getUsername() : "unknown")
                    .text("+new post \"" + truncate(p.getTitle(), 60) + "\"")
                    .createdAt(p.getCreatedAt())
                    .build());
        }

        var recentProjects = projectRepository.findAll(
                PageRequest.of(0, perSource, Sort.by(Sort.Direction.DESC, "createdAt")));
        for (Project pr : recentProjects) {
            merged.add(PulseEntryResponse.builder()
                    .type("project")
                    .actor(pr.getOwner() != null ? pr.getOwner().getUsername() : "unknown")
                    .text("started project \"" + truncate(pr.getName(), 60) + "\"")
                    .createdAt(pr.getCreatedAt())
                    .build());
        }

        var recentFollows = userFollowRepository.findAll(
                PageRequest.of(0, perSource, Sort.by(Sort.Direction.DESC, "createdAt")));
        for (UserFollow f : recentFollows) {
            String follower = f.getFollower() != null ? f.getFollower().getUsername() : "unknown";
            String following = f.getFollowing() != null ? f.getFollowing().getUsername() : "unknown";
            merged.add(PulseEntryResponse.builder()
                    .type("follow")
                    .actor(follower)
                    .text("started following @" + following)
                    .createdAt(f.getCreatedAt())
                    .build());
        }

        merged.sort(Comparator.comparing(
                PulseEntryResponse::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return merged.stream().limit(limit).toList();
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max - 1) + "…";
    }
}
