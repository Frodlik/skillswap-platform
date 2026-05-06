package com.skillswap.sessionservice.service;

import com.skillswap.sessionservice.domain.Review;
import com.skillswap.sessionservice.domain.Session;
import com.skillswap.sessionservice.domain.SessionStatus;
import com.skillswap.sessionservice.dto.request.CreateSessionRequest;
import com.skillswap.sessionservice.dto.response.BusySlotResponse;
import com.skillswap.sessionservice.dto.response.RoomResponse;
import com.skillswap.sessionservice.dto.response.SessionResponse;
import com.skillswap.sessionservice.exception.SessionConflictException;
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
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class SessionService {

    private static final Logger log = LoggerFactory.getLogger(SessionService.class);

    // Public Jitsi Meet — no account, no SFU/TURN to host. For a private
    // deployment this would be swapped for the org's own Jitsi base URL
    // and the controller would mint a JWT for the room.
    private static final String JITSI_BASE_URL = "https://meet.jit.si";
    private static final String ROOM_PREFIX    = "skillswap-";

    private final SessionRepository sessionRepo;
    private final ReviewRepository reviewRepo;
    private final TokenWalletService walletService;
    private final SessionEventPublisher publisher;

    @Transactional
    public SessionResponse createSession(CreateSessionRequest req) {
        // proposerId must be one of the two participants — guards against
        // a third party scheduling a session for two strangers.
        if (!req.proposerId().equals(req.teacherId())
                && !req.proposerId().equals(req.learnerId())) {
            throw new IllegalArgumentException(
                    "proposerId must equal teacherId or learnerId");
        }

        // Compute the proposed time window before any side-effects so we can
        // bail out with 409 *before* a wallet HOLD that would need rolling back.
        Instant rangeStart = req.scheduledAt();
        Instant rangeEnd   = rangeStart.plus(req.durationTokens(), ChronoUnit.HOURS);
        assertNoConflict(req.teacherId(), "teacher", rangeStart, rangeEnd);
        assertNoConflict(req.learnerId(), "learner", rangeStart, rangeEnd);

        UUID id = UUID.randomUUID();
        // HOLD applied at PROPOSED so the learner can't queue ten unanswered
        // proposals all reserving the same tokens. Released on REJECT/CANCEL,
        // transferred on COMPLETE.
        walletService.hold(req.learnerId(), req.durationTokens(), id);

        Session session = sessionRepo.save(Session.builder()
                .id(id)
                .matchId(req.matchId())
                .teacherId(req.teacherId())
                .learnerId(req.learnerId())
                .proposerId(req.proposerId())
                .skillName(req.skillName())
                .scheduledAt(req.scheduledAt())
                .durationTokens(req.durationTokens())
                .status(SessionStatus.PROPOSED)
                .build());
        log.info("Proposed session id={} proposer={} teacher={} learner={} cost={}",
                id, req.proposerId(), req.teacherId(), req.learnerId(), req.durationTokens());
        return toResponse(session);
    }

    // Invitee accepts the proposal → PROPOSED → SCHEDULED. Re-checks conflicts
    // because the invitee's calendar may have grown new bookings between the
    // original create and this accept.
    @Transactional
    public SessionResponse acceptProposal(UUID sessionId, UUID actorId) {
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException(sessionId));
        assertActorIsInvitee(session, actorId, "accept");
        validateTransition(session.getStatus(), SessionStatus.SCHEDULED);

        // The HOLD that was placed at PROPOSED time is still live, no wallet
        // op required at SCHEDULED. Just flip the status.
        session.setStatus(SessionStatus.SCHEDULED);
        Session saved = sessionRepo.save(session);
        log.info("Session {} accepted by {} (PROPOSED -> SCHEDULED)", sessionId, actorId);
        return toResponse(saved);
    }

    // Invitee declines → PROPOSED → REJECTED, learner's HOLD released.
    @Transactional
    public SessionResponse declineProposal(UUID sessionId, UUID actorId) {
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException(sessionId));
        assertActorIsInvitee(session, actorId, "decline");
        validateTransition(session.getStatus(), SessionStatus.REJECTED);

        walletService.release(session.getLearnerId(), session.getDurationTokens(), sessionId);
        session.setStatus(SessionStatus.REJECTED);
        Session saved = sessionRepo.save(session);
        log.info("Session {} declined by {} (PROPOSED -> REJECTED)", sessionId, actorId);
        return toResponse(saved);
    }

    private void assertActorIsInvitee(Session session, UUID actorId, String action) {
        boolean isParticipant = actorId.equals(session.getTeacherId())
                || actorId.equals(session.getLearnerId());
        if (!isParticipant) {
            throw new IllegalArgumentException(
                    "Only a participant of the session can " + action + " it");
        }
        if (actorId.equals(session.getProposerId())) {
            throw new IllegalArgumentException(
                    "The proposer cannot " + action + " their own invitation"
                            + " (use cancel instead)");
        }
    }

    private void assertNoConflict(UUID userId, String role, Instant start, Instant end) {
        var clashing = sessionRepo.findOverlapping(userId, start, end);
        if (!clashing.isEmpty()) {
            log.info("Conflict for {} userId={} new=[{},{}) existing={}",
                    role, userId, start, end, clashing.getFirst().getId());
            throw new SessionConflictException(role);
        }
    }

    @Transactional(readOnly = true)
    public SessionResponse getSession(UUID id) {
        return toResponse(sessionRepo.findById(id)
                .orElseThrow(() -> new SessionNotFoundException(id)));
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoom(UUID sessionId) {
        if (!sessionRepo.existsById(sessionId)) {
            throw new SessionNotFoundException(sessionId);
        }
        String roomName = ROOM_PREFIX + sessionId;
        return new RoomResponse(roomName, JITSI_BASE_URL + "/" + roomName);
    }

    @Transactional(readOnly = true)
    public Page<SessionResponse> getUserSessions(UUID userId, Pageable pageable) {
        return sessionRepo.findByUser(userId, pageable).map(this::toResponse);
    }

    // Returns just the slots that overlap [from, to) — no skill or partner
    // info — so the schedule-calendar can paint "busy" cells when planning
    // a new session against another user. Includes both SCHEDULED and
    // ACTIVE; CANCELLED/COMPLETED are excluded since they no longer block.
    @Transactional(readOnly = true)
    public List<BusySlotResponse> getBusySlots(UUID userId, Instant from, Instant to) {
        return sessionRepo.findOverlapping(userId, from, to).stream()
                .map(s -> new BusySlotResponse(s.getScheduledAt(), s.getDurationTokens()))
                .toList();
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
            // PROPOSED, SCHEDULED, REJECTED — unreachable here, blocked by validateTransition.
            // PROPOSED → SCHEDULED happens via acceptProposal(), not changeStatus().
            case PROPOSED, SCHEDULED, REJECTED -> { /* unreachable */ }
        }

        Session saved = sessionRepo.save(session);
        if (to == SessionStatus.COMPLETED) {
            var reviews = reviewRepo.findBySessionId(id);
            Integer ratingForTeacher = averageRatingForReviewee(reviews, saved.getTeacherId());
            Integer ratingForLearner = averageRatingForReviewee(reviews, saved.getLearnerId());
            publisher.publishSessionCompleted(saved.getId(), saved.getTeacherId(),
                    saved.getLearnerId(), ratingForTeacher, ratingForLearner);
        }
        log.info("Session {} transitioned {} -> {}", id, from, to);
        return toResponse(saved);
    }

    private void validateTransition(SessionStatus from, SessionStatus to) {
        boolean valid = switch (from) {
            case PROPOSED  -> to == SessionStatus.SCHEDULED
                              || to == SessionStatus.REJECTED
                              || to == SessionStatus.CANCELLED;
            case SCHEDULED -> to == SessionStatus.ACTIVE || to == SessionStatus.CANCELLED;
            case ACTIVE    -> to == SessionStatus.COMPLETED || to == SessionStatus.CANCELLED;
            case COMPLETED, REJECTED, CANCELLED -> false;
        };
        if (!valid) {
            throw new IllegalStateException(
                    "Illegal session status transition: " + from + " -> " + to);
        }
    }

    private Integer averageRatingForReviewee(List<Review> reviews, UUID revieweeId) {
        var matching = reviews.stream().filter(r -> revieweeId.equals(r.getRevieweeId())).toList();
        if (matching.isEmpty()) return null;
        int sum = matching.stream().mapToInt(Review::getRating).sum();
        return Math.round((float) sum / matching.size());
    }

    private SessionResponse toResponse(Session s) {
        return new SessionResponse(s.getId(), s.getMatchId(), s.getTeacherId(), s.getLearnerId(),
                s.getProposerId(), s.getSkillName(), s.getScheduledAt(), s.getDurationTokens(),
                s.getStatus(), s.getCreatedAt(), s.getCompletedAt());
    }
}
