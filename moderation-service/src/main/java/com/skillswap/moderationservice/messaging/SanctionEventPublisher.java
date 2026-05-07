package com.skillswap.moderationservice.messaging;

import com.skillswap.moderationservice.config.RabbitMqConfig;
import com.skillswap.moderationservice.event.UserSanctionLiftedEvent;
import com.skillswap.moderationservice.event.UserSanctionedEvent;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Component
@AllArgsConstructor
public class SanctionEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(SanctionEventPublisher.class);
    private final RabbitTemplate rabbitTemplate;

    public void publishSanctioned(UUID userId, String type, Instant expiresAt) {
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.USER_SANCTIONED_KEY,
                new UserSanctionedEvent(userId, type, expiresAt));
        log.info("Published user.sanctioned userId={} type={}", userId, type);
    }

    public void publishSanctionLifted(UUID userId) {
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.USER_SANCTION_LIFTED_KEY,
                new UserSanctionLiftedEvent(userId));
        log.info("Published user.sanction-lifted userId={}", userId);
    }
}
