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
            case SkillCreatedEvent.Offered(var payload) -> publish(
                    RabbitMqConfig.SKILL_OFFERED_KEY, payload, payload.skillId());
            case SkillCreatedEvent.Wanted(var payload) -> publish(
                    RabbitMqConfig.SKILL_WANTED_KEY, payload, payload.skillId());
        }
    }

    private void publish(String routingKey, Object payload, java.util.UUID skillId) {
        try {
            rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE, routingKey, payload);
            log.info("Published '{}' skillId={}", routingKey, skillId);
        } catch (org.springframework.amqp.AmqpException ex) {
            log.error("Failed to publish '{}' skillId={} — event lost", routingKey, skillId, ex);
        }
    }
}
