package com.skillswap.sessionservice.messaging;

import com.skillswap.sessionservice.config.RabbitMqConfig;
import com.skillswap.sessionservice.event.inbound.MatchAcceptedEvent;
import com.skillswap.sessionservice.event.inbound.UserRegisteredEvent;
import com.skillswap.sessionservice.service.TokenWalletService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class SessionEventListener {

    private static final Logger log = LoggerFactory.getLogger(SessionEventListener.class);

    private final TokenWalletService walletService;

    @RabbitListener(queues = RabbitMqConfig.MATCH_ACCEPTED_QUEUE)
    public void onMatchAccepted(MatchAcceptedEvent event) {
        log.info("match.accepted matchId={}", event.matchId());
        walletService.createWalletIfMissing(event.userAId());
        walletService.createWalletIfMissing(event.userBId());
    }

    @RabbitListener(queues = RabbitMqConfig.USER_REGISTERED_QUEUE)
    public void onUserRegistered(UserRegisteredEvent event) {
        log.info("user.registered userId={}", event.userId());
        walletService.createWalletWithSignupBonus(event.userId());
    }
}
