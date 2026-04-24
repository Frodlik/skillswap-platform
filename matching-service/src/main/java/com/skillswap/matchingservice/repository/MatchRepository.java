package com.skillswap.matchingservice.repository;

import com.skillswap.matchingservice.domain.Match;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MatchRepository extends JpaRepository<Match, UUID> {

    @Query("SELECT m FROM Match m WHERE (m.userAId = :userId OR m.userBId = :userId) " +
           "AND m.status = com.skillswap.matchingservice.domain.MatchStatus.PENDING " +
           "AND m.expiresAt > :now ORDER BY m.totalScore DESC")
    List<Match> findActiveSuggestions(@Param("userId") UUID userId,
                                      @Param("now") Instant now,
                                      Pageable pageable);

    @Query("SELECT m FROM Match m WHERE (m.userAId = :userId OR m.userBId = :userId) " +
           "AND m.status <> com.skillswap.matchingservice.domain.MatchStatus.PENDING")
    List<Match> findHistory(@Param("userId") UUID userId);

    @Query("SELECT m FROM Match m WHERE " +
           "((m.userAId = :userAId AND m.userBId = :userBId) OR " +
           "(m.userAId = :userBId AND m.userBId = :userAId)) " +
           "AND m.status = com.skillswap.matchingservice.domain.MatchStatus.PENDING")
    Optional<Match> findPendingBetween(@Param("userAId") UUID userAId,
                                       @Param("userBId") UUID userBId);
}
