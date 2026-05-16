package com.synora.modules.user.entity;

import com.synora.modules.subscription.entity.SubscriptionTier;
import com.synora.modules.verification.entity.VerificationType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "github_id", unique = true, length = 64)
    private String githubId;

    @Column(name = "google_id", unique = true, length = 64)
    private String googleId;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(length = 100)
    private String location;

    @Column(length = 120)
    private String headline;

    @Column(length = 30)
    private String pronouns;

    @Column(name = "available_for", length = 120)
    private String availableFor;

    @Column(length = 60)
    private String specialization;

    @Column(name = "career_goal", length = 60)
    private String careerGoal;

    @Builder.Default
    @Column(name = "onboarding_completed", nullable = false)
    private boolean onboardingCompleted = false;

    @Builder.Default
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "user_role")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    @Builder.Default
    private UserRole role = UserRole.USER;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Builder.Default
    @Column(name = "is_banned", nullable = false)
    private boolean banned = false;

    @Column(name = "ban_reason", length = 500)
    private String banReason;

    @Column(name = "banned_at")
    private Instant bannedAt;

    @Column(name = "banned_by")
    private UUID bannedById;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_tier", nullable = false, columnDefinition = "subscription_tier")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    @Builder.Default
    private SubscriptionTier subscriptionTier = SubscriptionTier.FREE;

    @Builder.Default
    @Column(name = "is_verified", nullable = false)
    private boolean verified = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_type", columnDefinition = "verification_type")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private VerificationType verificationType;

    @Builder.Default
    @Column(name = "reputation_score", nullable = false)
    private int reputationScore = 0;

    // --- 2FA ---
    @Builder.Default
    @Column(name = "two_factor_enabled", nullable = false)
    private boolean twoFactorEnabled = false;

    @Column(name = "totp_secret", length = 64)
    private String totpSecret;

    @Column(name = "totp_backup_codes", columnDefinition = "TEXT")
    private String totpBackupCodes;

    // --- Privacy ---
    @Builder.Default
    @Column(name = "profile_visibility", nullable = false, length = 20)
    private String profileVisibility = "PUBLIC";

    @Builder.Default
    @Column(name = "show_email", nullable = false)
    private boolean showEmail = false;

    @Builder.Default
    @Column(name = "show_activity", nullable = false)
    private boolean showActivity = true;

    @Builder.Default
    @Column(name = "show_online_status", nullable = false)
    private boolean showOnlineStatus = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // --- UserDetails impl ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public boolean isAccountNonExpired()  { return true; }

    @Override
    public boolean isAccountNonLocked()   { return !banned; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled()            { return active; }
}
