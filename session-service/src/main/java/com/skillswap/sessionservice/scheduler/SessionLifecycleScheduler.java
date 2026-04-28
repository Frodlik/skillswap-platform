package com.skillswap.sessionservice.scheduler;

import com.skillswap.sessionservice.domain.Session;
import com.skillswap.sessionservice.domain.SessionStatus;
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

    @Scheduled(fixedDelayString = "${session.scheduler.fixed-delay-ms:30000}",
               initialDelayString = "${session.scheduler.initial-delay-ms:30000}")
    public void tick() {
        Instant now = Instant.now();
        activateDueSessions(now);
        completeFinishedSessions(now);
    }

    void activateDueSessions(Instant now) {
        List<Session> due = sessionRepo
                .findByStatusAndScheduledAtLessThanEqual(SessionStatus.SCHEDULED, now);
        for (Session s : due) {
            transition(s.getId(), SessionStatus.ACTIVE);
        }
    }

    void completeFinishedSessions(Instant now) {
        List<Session> active = sessionRepo.findByStatus(SessionStatus.ACTIVE);
        for (Session s : active) {
            Instant endsAt = s.getScheduledAt().plus(TOKEN_DURATION.multipliedBy(s.getDurationTokens()));
            if (!endsAt.isAfter(now)) {
                transition(s.getId(), SessionStatus.COMPLETED);
            }
        }
    }

    private void transition(UUID id, SessionStatus to) {
        try {
            sessionService.changeStatus(id, to);
        } catch (RuntimeException e) {
            log.warn("Auto-transition session={} -> {} failed: {}", id, to, e.getMessage());
        }
    }
}
