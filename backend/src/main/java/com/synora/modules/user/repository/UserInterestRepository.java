package com.synora.modules.user.repository;

import com.synora.modules.user.entity.UserInterest;
import com.synora.modules.user.entity.UserInterestId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserInterestRepository extends JpaRepository<UserInterest, UserInterestId> {

    @Query("SELECT i.id.name FROM UserInterest i WHERE i.id.userId = :userId ORDER BY i.id.name")
    List<String> findNamesByUserId(UUID userId);

    @Modifying
    @Query("DELETE FROM UserInterest i WHERE i.id.userId = :userId")
    void deleteAllByUserId(UUID userId);

    @Query("SELECT DISTINCT i.id.userId FROM UserInterest i " +
           "WHERE LOWER(i.id.name) IN :names AND i.id.userId <> :excludeId")
    List<UUID> findUserIdsByInterestNamesLower(
            @org.springframework.data.repository.query.Param("names") java.util.Collection<String> lowerNames,
            @org.springframework.data.repository.query.Param("excludeId") UUID excludeId);
}
