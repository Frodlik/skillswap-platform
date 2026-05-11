package com.skillswap.sessionservice.scheduler;

import com.skillswap.sessionservice.domain.Session;
import com.skillswap.sessionservice.domain.SessionStatus;
import com.skillswap.sessionservice.messaging.SessionEventPublisher;
import com.skillswap.sessionservice.repository.SessionRepository;
import com.skillswap.sessionservice.service.SessionService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@AllArgsConstructor
public class SessionLifecycleScheduler {

    private static final Logger log = LoggerFactory.getLogger(SessionLifecycleScheduler.class);

    static final Duration TOKEN_DURATION = Duration.ofHours(1);

    private final SessionRepository sessionRepo;
    private final SessionService sessionService;
    private final SessionEventPublisher publisher;

    @Scheduled(fixedDelayString = "${session.scheduler.fixed-delay-ms:30000}",
               initialDelayString = "${session.scheduler.initial-delay-ms:30000}")
    public void tick() {
        Instant now = Instant.now();
        expireStaleProposals(now);
        activateDueSessions(now);
        completeFinishedSessions(now);
    }

    // Auto-cancels PROPOSED sessions whose scheduledAt has come and gone
    // without a response from the invitee. Without this, abandoned proposals
    // would lock the learner's tokens forever. We treat past-due-without-
    // accept as an implicit decline so the proposer learns about it through
    // the existing session.declined notification flow.
    void expireStaleProposals(Instant now) {
        List<Session> stale = sessionRepo
                .findByStatusAndScheduledAtLessThanEqual(SessionStatus.PROPOSED, now);
        for (Session s : stale) {
            try {
                // The teacher-only check inside changeStatus only fires for
                // ACTIVE → CANCELLED; PROPOSED → CANCELLED ignores actorId,
                // so the value here doesn't gate anything. We pass teacherId
                // as a stable "system-acting-as-teacher" identity for logs.
                sessionService.changeStatus(s.getId(), SessionStatus.CANCELLED, s.getTeacherId());
                publisher.publishSessionDeclined(s, true);
                log.info("Auto-cancelled stale PROPOSED session={} (scheduledAt={} now={})",
                        s.getId(), s.getScheduledAt(), now);
            } catch (RuntimeException e) {
                log.warn("Auto-expire session={} failed: {}", s.getId(), e.getMessage());
            }
        }
    }

    void activateDueSessions(Instant now) {
        List<Session> due = sessionRepo
                .findByStatusAndScheduledAtLessThanEqual(SessionStatus.SCHEDULED, now);
        for (Session s : due) {
            transition(s, SessionStatus.ACTIVE);
        }
    }

    void completeFinishedSessions(Instant now) {
        List<Session> active = sessionRepo.findByStatus(SessionStatus.ACTIVE);
        for (Session s : active) {
            Instant endsAt = s.getScheduledAt().plus(TOKEN_DURATION.multipliedBy(s.getDurationTokens()));
            if (!endsAt.isAfter(now)) {
                transition(s, SessionStatus.COMPLETED);
            }
        }
    }

    private void transition(Session s, SessionStatus to) {
        try {
            sessionService.changeStatus(s.getId(), to, s.getTeacherId());
        } catch (RuntimeException e) {
            log.warn("Auto-transition session={} -> {} failed: {}", s.getId(), to, e.getMessage());
        }
    }
}
