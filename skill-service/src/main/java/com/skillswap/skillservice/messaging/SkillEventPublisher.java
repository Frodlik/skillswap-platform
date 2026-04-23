package com.skillswap.skillservice.messaging;

import com.skillswap.skillservice.config.RabbitMqConfig;
import com.skillswap.skillservice.event.SkillCreatedEvent;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@AllArgsConstructor
public class SkillEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(SkillEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(SkillCreatedEvent event) {
        switch (event) {
            case SkillCreatedEvent.Offered(var payload) -> {
                rabbitTemplate.convertAndSend(
                        RabbitMqConfig.EXCHANGE, RabbitMqConfig.SKILL_OFFERED_KEY, payload);
                log.info("Published '{}' skillId={}", RabbitMqConfig.SKILL_OFFERED_KEY, payload.skillId());
            }
            case SkillCreatedEvent.Wanted(var payload) -> {
                rabbitTemplate.convertAndSend(
                        RabbitMqConfig.EXCHANGE, RabbitMqConfig.SKILL_WANTED_KEY, payload);
                log.info("Published '{}' skillId={}", RabbitMqConfig.SKILL_WANTED_KEY, payload.skillId());
            }
        }
    }
}
