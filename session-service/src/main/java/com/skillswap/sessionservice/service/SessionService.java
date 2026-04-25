package com.skillswap.sessionservice.service;

import com.skillswap.sessionservice.domain.Session;
import com.skillswap.sessionservice.domain.SessionStatus;
import com.skillswap.sessionservice.dto.request.CreateSessionRequest;
import com.skillswap.sessionservice.dto.response.SessionResponse;
import com.skillswap.sessionservice.exception.SessionNotFoundException;
import com.skillswap.sessionservice.messaging.SessionEventPublisher;
import com.skillswap.sessionservice.repository.ReviewRepository;
import com.skillswap.sessionservice.repository.SessionRepository;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@AllArgsConstructor
public class SessionService {

    private static final Logger log = LoggerFactory.getLogger(SessionService.class);

    private final SessionRepository sessionRepo;
    private final ReviewRepository reviewRepo;
    private final TokenWalletService walletService;
    private final SessionEventPublisher publisher;

    @Transactional
    public SessionResponse createSession(CreateSessionRequest req) {
        UUID id = UUID.randomUUID();
        walletService.hold(req.learnerId(), req.durationTokens(), id);

        Session session = sessionRepo.save(Session.builder()
                .id(id)
                .matchId(req.matchId())
                .teacherId(req.teacherId())
                .learnerId(req.learnerId())
                .skillName(req.skillName())
                .scheduledAt(req.scheduledAt())
                .durationTokens(req.durationTokens())
                .status(SessionStatus.SCHEDULED)
                .build());
        log.info("Created session id={} learner={} teacher={} cost={}",
                id, req.learnerId(), req.teacherId(), req.durationTokens());
        return toResponse(session);
    }

    @Transactional(readOnly = true)
    public SessionResponse getSession(UUID id) {
        return toResponse(sessionRepo.findById(id)
                .orElseThrow(() -> new SessionNotFoundException(id)));
    }

    @Transactional(readOnly = true)
    public Page<SessionResponse> getUserSessions(UUID userId, Pageable pageable) {
        return sessionRepo.findByUser(userId, pageable).map(this::toResponse);
    }

    @Transactional
    public SessionResponse changeStatus(UUID id, SessionStatus to) {
        Session session = sessionRepo.findById(id)
                .orElseThrow(() -> new SessionNotFoundException(id));
        validateTransition(session.getStatus(), to);

        SessionStatus from = session.getStatus();
        session.setStatus(to);

        switch (to) {
            case ACTIVE -> { /* no wallet op */ }
            case CANCELLED -> walletService.release(session.getLearnerId(), session.getDurationTokens(), id);
            case COMPLETED -> {
                walletService.transfer(session.getLearnerId(), session.getTeacherId(),
                        session.getDurationTokens(), id);
                session.setCompletedAt(Instant.now());
            }
            case SCHEDULED -> { /* unreachable, blocked by validateTransition */ }
        }

        Session saved = sessionRepo.save(session);
        if (to == SessionStatus.COMPLETED) {
            int avgRating = averageRating(id);
            publisher.publishSessionCompleted(saved.getId(), saved.getTeacherId(),
                    saved.getLearnerId(), saved.getSkillName(), avgRating);
        }
        log.info("Session {} transitioned {} -> {}", id, from, to);
        return toResponse(saved);
    }

    private void validateTransition(SessionStatus from, SessionStatus to) {
        boolean valid = switch (from) {
            case SCHEDULED -> to == SessionStatus.ACTIVE || to == SessionStatus.CANCELLED;
            case ACTIVE    -> to == SessionStatus.COMPLETED || to == SessionStatus.CANCELLED;
            case COMPLETED, CANCELLED -> false;
        };
        if (!valid) {
            throw new IllegalStateException(
                    "Illegal session status transition: " + from + " -> " + to);
        }
    }

    private int averageRating(UUID sessionId) {
        var reviews = reviewRepo.findBySessionId(sessionId);
        if (reviews.isEmpty()) return 0;
        int sum = reviews.stream().mapToInt(r -> r.getRating()).sum();
        return Math.round((float) sum / reviews.size());
    }

    private SessionResponse toResponse(Session s) {
        return new SessionResponse(s.getId(), s.getMatchId(), s.getTeacherId(), s.getLearnerId(),
                s.getSkillName(), s.getScheduledAt(), s.getDurationTokens(), s.getStatus(),
                s.getCreatedAt(), s.getCompletedAt());
    }
}
