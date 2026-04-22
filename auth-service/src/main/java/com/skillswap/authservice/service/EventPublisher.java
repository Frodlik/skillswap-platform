package com.skillswap.authservice.service;

import com.skillswap.authservice.config.RabbitMqConfig;
import com.skillswap.authservice.event.DomainEvent;
import com.skillswap.authservice.event.UserRegisteredEvent;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Service
@AllArgsConstructor
public class EventPublisher {

    private static final Logger log = LoggerFactory.getLogger(EventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(DomainEvent event) {
        String routingKey = switch (event) {
            case UserRegisteredEvent e -> RabbitMqConfig.USER_REGISTERED_KEY;
        };

        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE, routingKey, event);
        log.info("Published event '{}' for userId={}", routingKey, event.userId());
    }
}