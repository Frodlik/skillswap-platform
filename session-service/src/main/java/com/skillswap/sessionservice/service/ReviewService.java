package com.skillswap.sessionservice.service;

import com.skillswap.sessionservice.domain.Review;
import com.skillswap.sessionservice.domain.Session;
import com.skillswap.sessionservice.dto.request.ReviewRequest;
import com.skillswap.sessionservice.dto.response.ReviewResponse;
import com.skillswap.sessionservice.exception.DuplicateReviewException;
import com.skillswap.sessionservice.exception.SessionNotFoundException;
import com.skillswap.sessionservice.repository.ReviewRepository;
import com.skillswap.sessionservice.repository.SessionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@AllArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepo;
    private final SessionRepository sessionRepo;

    @Transactional
    public ReviewResponse submitReview(UUID sessionId, ReviewRequest req) {
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException(sessionId));

        if (!req.reviewerId().equals(session.getTeacherId())
                && !req.reviewerId().equals(session.getLearnerId())) {
            throw new IllegalArgumentException(
                    "Reviewer is not a participant of session " + sessionId);
        }
        if (reviewRepo.existsBySessionIdAndReviewerId(sessionId, req.reviewerId())) {
            throw new DuplicateReviewException(sessionId, req.reviewerId());
        }

        Review saved = reviewRepo.save(Review.builder()
                .id(UUID.randomUUID())
                .sessionId(sessionId)
                .reviewerId(req.reviewerId())
                .revieweeId(req.revieweeId())
                .rating(req.rating())
                .comment(req.comment())
                .build());
        return toResponse(saved);
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(r.getId(), r.getSessionId(), r.getReviewerId(),
                r.getRevieweeId(), r.getRating(), r.getComment(), r.getCreatedAt());
    }
}
