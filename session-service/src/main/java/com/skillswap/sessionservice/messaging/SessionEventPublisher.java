package com.skillswap.sessionservice.messaging;

import com.skillswap.sessionservice.config.RabbitMqConfig;
import com.skillswap.sessionservice.domain.Session;
import com.skillswap.sessionservice.event.outbound.SessionAcceptedEvent;
import com.skillswap.sessionservice.event.outbound.SessionCompletedEvent;
import com.skillswap.sessionservice.event.outbound.SessionDeclinedEvent;
import com.skillswap.sessionservice.event.outbound.SessionProposedEvent;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@AllArgsConstructor
public class SessionEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(SessionEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public void publishSessionCompleted(UUID sessionId, UUID teacherId, UUID learnerId,
                                        Integer ratingForTeacher, Integer ratingForLearner) {
        var event = new SessionCompletedEvent(sessionId, teacherId, learnerId,
                ratingForTeacher, ratingForLearner);
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SESSION_COMPLETED_KEY,
                event);
        log.info("Published session.completed sessionId={} ratingTeacher={} ratingLearner={}",
                sessionId, ratingForTeacher, ratingForLearner);
    }

    // The session entity is passed in whole because the publisher needs both
    // proposerId (to derive inviteeId) and the user-facing fields the email
    // template will render — pulling them out one-by-one in SessionService
    // would just spread the same logic across two files.
    public void publishSessionProposed(Session s) {
        UUID inviteeId = s.getProposerId().equals(s.getTeacherId())
                ? s.getLearnerId() : s.getTeacherId();
        var event = new SessionProposedEvent(
                s.getId(), s.getProposerId(), inviteeId,
                s.getTeacherId(), s.getLearnerId(),
                s.getSkillName(), s.getScheduledAt(), s.getDurationTokens());
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SESSION_PROPOSED_KEY, event);
        log.info("Published session.proposed sessionId={} invitee={}", s.getId(), inviteeId);
    }

    public void publishSessionAccepted(Session s) {
        UUID inviteeId = s.getProposerId().equals(s.getTeacherId())
                ? s.getLearnerId() : s.getTeacherId();
        var event = new SessionAcceptedEvent(
                s.getId(), s.getProposerId(), inviteeId,
                s.getSkillName(), s.getScheduledAt());
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SESSION_ACCEPTED_KEY, event);
        log.info("Published session.accepted sessionId={}", s.getId());
    }

    public void publishSessionDeclined(Session s, boolean autoExpired) {
        UUID inviteeId = s.getProposerId().equals(s.getTeacherId())
                ? s.getLearnerId() : s.getTeacherId();
        var event = new SessionDeclinedEvent(
                s.getId(), s.getProposerId(), inviteeId,
                s.getSkillName(), autoExpired);
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.SESSION_DECLINED_KEY, event);
        log.info("Published session.declined sessionId={} autoExpired={}", s.getId(), autoExpired);
    }
}
