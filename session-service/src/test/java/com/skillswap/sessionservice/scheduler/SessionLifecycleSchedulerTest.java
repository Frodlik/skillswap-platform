package com.skillswap.sessionservice.scheduler;

import com.skillswap.sessionservice.domain.Session;
import com.skillswap.sessionservice.domain.SessionStatus;
import com.skillswap.sessionservice.repository.SessionRepository;
import com.skillswap.sessionservice.service.SessionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionLifecycleSchedulerTest {

    @Mock SessionRepository sessionRepo;
    @Mock SessionService sessionService;
    @InjectMocks SessionLifecycleScheduler scheduler;

    @Test
    void activates_sessions_whose_scheduled_at_has_passed() {
        UUID id = UUID.randomUUID();
        Instant now = Instant.parse("2026-04-26T20:00:00Z");
        Session due = Session.builder().id(id).status(SessionStatus.SCHEDULED)
                .scheduledAt(now.minusSeconds(60)).durationTokens(1).build();

        when(sessionRepo.findByStatusAndScheduledAtLessThanEqual(SessionStatus.SCHEDULED, now))
                .thenReturn(List.of(due));

        scheduler.activateDueSessions(now);

        verify(sessionService).changeStatus(id, SessionStatus.ACTIVE);
    }

    @Test
    void does_not_activate_when_no_sessions_are_due() {
        Instant now = Instant.parse("2026-04-26T20:00:00Z");
        when(sessionRepo.findByStatusAndScheduledAtLessThanEqual(SessionStatus.SCHEDULED, now))
                .thenReturn(List.of());

        scheduler.activateDueSessions(now);

        verifyNoInteractions(sessionService);
    }

    @Test
    void completes_active_sessions_whose_end_time_has_passed() {
        UUID id = UUID.randomUUID();
        Instant now = Instant.parse("2026-04-26T20:00:00Z");
        // 1 token = 1h; scheduled 90 min ago → already over
        Session expired = Session.builder().id(id).status(SessionStatus.ACTIVE)
                .scheduledAt(now.minus(Duration.ofMinutes(90))).durationTokens(1).build();

        when(sessionRepo.findByStatus(SessionStatus.ACTIVE)).thenReturn(List.of(expired));

        scheduler.completeFinishedSessions(now);

        verify(sessionService).changeStatus(id, SessionStatus.COMPLETED);
    }

    @Test
    void does_not_complete_active_sessions_still_in_progress() {
        UUID id = UUID.randomUUID();
        Instant now = Instant.parse("2026-04-26T20:00:00Z");
        // 2-token session started 30 min ago — ends 90 min from now
        Session running = Session.builder().id(id).status(SessionStatus.ACTIVE)
                .scheduledAt(now.minus(Duration.ofMinutes(30))).durationTokens(2).build();

        when(sessionRepo.findByStatus(SessionStatus.ACTIVE)).thenReturn(List.of(running));

        scheduler.completeFinishedSessions(now);

        verify(sessionService, never()).changeStatus(any(), any());
    }

    @Test
    void completion_uses_one_hour_per_token() {
        UUID id = UUID.randomUUID();
        Instant now = Instant.parse("2026-04-26T20:00:00Z");
        // 3-token session, started exactly 3h ago — boundary, should complete
        Session boundary = Session.builder().id(id).status(SessionStatus.ACTIVE)
                .scheduledAt(now.minus(Duration.ofHours(3))).durationTokens(3).build();

        when(sessionRepo.findByStatus(SessionStatus.ACTIVE)).thenReturn(List.of(boundary));

        scheduler.completeFinishedSessions(now);

        verify(sessionService).changeStatus(id, SessionStatus.COMPLETED);
    }

    @Test
    void one_failure_does_not_stop_the_batch() {
        UUID failing = UUID.randomUUID();
        UUID surviving = UUID.randomUUID();
        Instant now = Instant.parse("2026-04-26T20:00:00Z");
        Session a = Session.builder().id(failing).status(SessionStatus.SCHEDULED)
                .scheduledAt(now.minusSeconds(60)).durationTokens(1).build();
        Session b = Session.builder().id(surviving).status(SessionStatus.SCHEDULED)
                .scheduledAt(now.minusSeconds(30)).durationTokens(1).build();

        when(sessionRepo.findByStatusAndScheduledAtLessThanEqual(SessionStatus.SCHEDULED, now))
                .thenReturn(List.of(a, b));
        org.mockito.Mockito.doThrow(new IllegalStateException("boom"))
                .when(sessionService).changeStatus(eq(failing), eq(SessionStatus.ACTIVE));

        scheduler.activateDueSessions(now);

        verify(sessionService, times(1)).changeStatus(failing, SessionStatus.ACTIVE);
        verify(sessionService, times(1)).changeStatus(surviving, SessionStatus.ACTIVE);
    }
}
