package com.skillswap.sessionservice.messaging;

import com.skillswap.sessionservice.config.RabbitMqConfig;
import com.skillswap.sessionservice.event.outbound.SessionCompletedEvent;
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
}
