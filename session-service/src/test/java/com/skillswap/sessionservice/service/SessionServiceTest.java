package com.skillswap.sessionservice.service;

import com.skillswap.sessionservice.domain.Session;
import com.skillswap.sessionservice.domain.SessionStatus;
import com.skillswap.sessionservice.dto.request.CreateSessionRequest;
import com.skillswap.sessionservice.dto.response.SessionResponse;
import com.skillswap.sessionservice.exception.SessionNotFoundException;
import com.skillswap.sessionservice.messaging.SessionEventPublisher;
import com.skillswap.sessionservice.repository.ReviewRepository;
import com.skillswap.sessionservice.repository.SessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock SessionRepository sessionRepo;
    @Mock ReviewRepository reviewRepo;
    @Mock TokenWalletService walletService;
    @Mock SessionEventPublisher publisher;

    @InjectMocks SessionService service;

    UUID teacherId;
    UUID learnerId;
    UUID sessionId;
    UUID matchId;

    @BeforeEach
    void init() {
        teacherId = UUID.randomUUID();
        learnerId = UUID.randomUUID();
        sessionId = UUID.randomUUID();
        matchId = UUID.randomUUID();
    }

    @Test
    void createSession_holdsTokensAndPersistsScheduledSession() {
        CreateSessionRequest req = new CreateSessionRequest(
                matchId, teacherId, learnerId, "Java", Instant.now().plusSeconds(3600), 2);
        when(sessionRepo.save(any(Session.class))).thenAnswer(inv -> inv.getArgument(0));

        SessionResponse resp = service.createSession(req);

        verify(walletService).hold(eq(learnerId), eq(2), any(UUID.class));
        ArgumentCaptor<Session> cap = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepo).save(cap.capture());
        assertThat(cap.getValue().getStatus()).isEqualTo(SessionStatus.SCHEDULED);
        assertThat(resp.status()).isEqualTo(SessionStatus.SCHEDULED);
    }

    @Test
    void changeStatus_scheduledToActive_isAllowedAndDoesNoWalletOp() {
        Session s = sessionFixture(SessionStatus.SCHEDULED);
        when(sessionRepo.findById(sessionId)).thenReturn(Optional.of(s));
        when(sessionRepo.save(any(Session.class))).thenAnswer(inv -> inv.getArgument(0));

        service.changeStatus(sessionId, SessionStatus.ACTIVE);

        assertThat(s.getStatus()).isEqualTo(SessionStatus.ACTIVE);
        verifyNoInteractions(walletService);
        verifyNoInteractions(publisher);
    }

    @Test
    void changeStatus_activeToCompleted_transfersTokensAndPublishesEvent() {
        Session s = sessionFixture(SessionStatus.ACTIVE);
        when(sessionRepo.findById(sessionId)).thenReturn(Optional.of(s));
        when(sessionRepo.save(any(Session.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewRepo.findBySessionId(sessionId)).thenReturn(List.of());

        service.changeStatus(sessionId, SessionStatus.COMPLETED);

        assertThat(s.getStatus()).isEqualTo(SessionStatus.COMPLETED);
        assertThat(s.getCompletedAt()).isNotNull();
        verify(walletService).transfer(eq(learnerId), eq(teacherId), eq(2), eq(sessionId));
        verify(publisher).publishSessionCompleted(eq(sessionId), eq(teacherId), eq(learnerId), eq("Java"), eq(0));
    }

    @Test
    void changeStatus_scheduledToCancelled_releasesHeldTokensWithoutPublishing() {
        Session s = sessionFixture(SessionStatus.SCHEDULED);
        when(sessionRepo.findById(sessionId)).thenReturn(Optional.of(s));
        when(sessionRepo.save(any(Session.class))).thenAnswer(inv -> inv.getArgument(0));

        service.changeStatus(sessionId, SessionStatus.CANCELLED);

        verify(walletService).release(eq(learnerId), eq(2), eq(sessionId));
        verifyNoInteractions(publisher);
    }

    @Test
    void changeStatus_activeToCancelled_releasesHeldTokens() {
        Session s = sessionFixture(SessionStatus.ACTIVE);
        when(sessionRepo.findById(sessionId)).thenReturn(Optional.of(s));
        when(sessionRepo.save(any(Session.class))).thenAnswer(inv -> inv.getArgument(0));

        service.changeStatus(sessionId, SessionStatus.CANCELLED);

        verify(walletService).release(eq(learnerId), eq(2), eq(sessionId));
    }

    @Test
    void changeStatus_completedToAnything_throwsIllegalState() {
        Session s = sessionFixture(SessionStatus.COMPLETED);
        when(sessionRepo.findById(sessionId)).thenReturn(Optional.of(s));

        assertThatThrownBy(() -> service.changeStatus(sessionId, SessionStatus.ACTIVE))
                .isInstanceOf(IllegalStateException.class);
        verify(sessionRepo, times(0)).save(any());
    }

    @Test
    void changeStatus_scheduledToCompleted_throwsIllegalState() {
        Session s = sessionFixture(SessionStatus.SCHEDULED);
        when(sessionRepo.findById(sessionId)).thenReturn(Optional.of(s));

        assertThatThrownBy(() -> service.changeStatus(sessionId, SessionStatus.COMPLETED))
                .isInstanceOf(IllegalStateException.class);
        verifyNoInteractions(walletService);
    }

    @Test
    void changeStatus_throwsSessionNotFoundForUnknownId() {
        when(sessionRepo.findById(sessionId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.changeStatus(sessionId, SessionStatus.ACTIVE))
                .isInstanceOf(SessionNotFoundException.class);
    }

    @Test
    void completedEvent_carriesAverageRatingWhenReviewsExist() {
        Session s = sessionFixture(SessionStatus.ACTIVE);
        when(sessionRepo.findById(sessionId)).thenReturn(Optional.of(s));
        when(sessionRepo.save(any(Session.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewRepo.findBySessionId(sessionId)).thenReturn(List.of(
                reviewWithRating(5), reviewWithRating(3)));

        service.changeStatus(sessionId, SessionStatus.COMPLETED);

        verify(publisher).publishSessionCompleted(eq(sessionId), eq(teacherId), eq(learnerId), eq("Java"), eq(4));
    }

    private Session sessionFixture(SessionStatus status) {
        return Session.builder()
                .id(sessionId).matchId(matchId).teacherId(teacherId).learnerId(learnerId)
                .skillName("Java").scheduledAt(Instant.now().plusSeconds(3600))
                .durationTokens(2).status(status).build();
    }

    private com.skillswap.sessionservice.domain.Review reviewWithRating(int rating) {
        return com.skillswap.sessionservice.domain.Review.builder()
                .id(UUID.randomUUID()).sessionId(sessionId)
                .reviewerId(UUID.randomUUID()).revieweeId(UUID.randomUUID())
                .rating(rating).build();
    }
}
