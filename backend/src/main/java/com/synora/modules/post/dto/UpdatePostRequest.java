package com.synora.modules.post.dto;

import com.synora.modules.post.entity.PostStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdatePostRequest {

    @Size(max = 300)
    private String title;

    private String content;

    @Size(max = 500)
    private String preview;

    @Size(max = 500)
    private String coverUrl;

    private PostStatus status;

    private List<Long> tagIds;
}
