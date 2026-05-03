package com.synora.modules.subscription.repository;

import com.synora.modules.subscription.entity.SubscriptionStatus;
import com.synora.modules.subscription.entity.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, UUID> {

    @Query("SELECT s FROM UserSubscription s WHERE s.user.id = :userId AND s.status = :status ORDER BY s.startedAt DESC LIMIT 1")
    Optional<UserSubscription> findLatestByUserIdAndStatus(@Param("userId") UUID userId,
                                                           @Param("status") SubscriptionStatus status);

    @Query("SELECT s FROM UserSubscription s WHERE s.user.id = :userId ORDER BY s.startedAt DESC LIMIT 1")
    Optional<UserSubscription> findLatestByUserId(@Param("userId") UUID userId);
}
