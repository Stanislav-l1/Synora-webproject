package com.synora.modules.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class UserProfileResponse {
    private UUID    id;
    private String  username;
    private String  displayName;
    private String  avatarUrl;
    private String  bio;
    private String  githubUrl;
    private String  websiteUrl;
    private String  location;
    private String  headline;
    private String  pronouns;
    private String  availableFor;
    private String  specialization;
    private String  careerGoal;
    private List<String> interests;
    private boolean onboardingCompleted;
    private int     reputationScore;
    private String  role;
    private Instant createdAt;
    private List<SkillDto> skills;
    private String  subscriptionTier;
}
