package com.skillswap.authservice.service;

import com.skillswap.authservice.config.RabbitMqConfig;
import com.skillswap.authservice.event.DomainEvent;
import com.skillswap.authservice.event.UserRegisteredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class EventPublisher {

    private static final Logger log = LoggerFactory.getLogger(EventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public EventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(DomainEvent event) {
        String routingKey = switch (event) {
            case UserRegisteredEvent e -> RabbitMqConfig.USER_REGISTERED_KEY;
        };

        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE, routingKey, event);
        log.info("Published event '{}' for userId={}", routingKey, event.userId());
    }
}