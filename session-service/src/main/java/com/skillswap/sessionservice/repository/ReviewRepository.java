package com.skillswap.sessionservice.repository;

import com.skillswap.sessionservice.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    boolean existsBySessionIdAndReviewerId(UUID sessionId, UUID reviewerId);
    List<Review> findBySessionId(UUID sessionId);
}
