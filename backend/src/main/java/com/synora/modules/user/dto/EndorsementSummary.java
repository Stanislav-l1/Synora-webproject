package com.synora.modules.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EndorsementSummary {
    private Long skillId;
    private String skillName;
    private long count;
    private boolean endorsedByMe;
    private List<EndorserMini> recentEndorsers;

    @Getter
    @Builder
    public static class EndorserMini {
        private java.util.UUID id;
        private String username;
        private String displayName;
        private String avatarUrl;
    }
}
