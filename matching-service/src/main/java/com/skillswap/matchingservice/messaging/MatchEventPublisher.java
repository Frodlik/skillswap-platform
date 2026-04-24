package com.skillswap.matchingservice.messaging;

import com.skillswap.matchingservice.config.RabbitMqConfig;
import com.skillswap.matchingservice.domain.Match;
import com.skillswap.matchingservice.event.outbound.MatchAcceptedEvent;
import com.skillswap.matchingservice.event.outbound.MatchFoundEvent;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class MatchEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(MatchEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public void publishMatchFound(Match match) {
        var event = new MatchFoundEvent(
                match.getId(), match.getUserAId(), match.getUserBId(), match.getTotalScore());
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE, RabbitMqConfig.MATCH_FOUND_KEY, event);
        log.info("Published match.found for matchId={}", match.getId());
    }

    public void publishMatchAccepted(Match match) {
        var event = new MatchAcceptedEvent(
                match.getId(), match.getUserAId(), match.getUserBId());
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE, RabbitMqConfig.MATCH_ACCEPTED_KEY, event);
        log.info("Published match.accepted for matchId={}", match.getId());
    }
}
