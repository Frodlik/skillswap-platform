package com.skillswap.userservice.messaging;

import com.skillswap.userservice.config.RabbitMqConfig;
import com.skillswap.userservice.event.ProfileUpdated;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class ProfileEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ProfileEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public ProfileEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(ProfileUpdated event) {
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.EXCHANGE,
                RabbitMqConfig.PROFILE_UPDATED_KEY,
                event);
        log.info("Published '{}' for userId={}", RabbitMqConfig.PROFILE_UPDATED_KEY, event.userId());
    }
}
