package com.skillswap.authservice.messaging;

import com.skillswap.authservice.config.RabbitMqConfig;
import com.skillswap.authservice.domain.BanType;
import com.skillswap.authservice.domain.UserBan;
import com.skillswap.authservice.event.UserSanctionLiftedEvent;
import com.skillswap.authservice.event.UserSanctionedEvent;
import com.skillswap.authservice.repository.UserBanRepository;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@AllArgsConstructor
public class SanctionEventListener {

    private static final Logger log = LoggerFactory.getLogger(SanctionEventListener.class);
    private final UserBanRepository userBanRepository;

    @RabbitListener(queues = RabbitMqConfig.USER_SANCTIONED_QUEUE)
    @Transactional
    public void handleSanctioned(UserSanctionedEvent event) {
        if ("WARNING".equals(event.type())) {
            return;
        }
        BanType banType = BanType.valueOf(event.type());
        userBanRepository.deleteByUserId(event.userId());
        userBanRepository.save(UserBan.builder()
                .id(UUID.randomUUID())
                .userId(event.userId())
                .type(banType)
                .expiresAt(event.expiresAt())
                .build());
        log.warn("Ban applied userId={} type={}", event.userId(), event.type());
    }

    @RabbitListener(queues = RabbitMqConfig.USER_SANCTION_LIFTED_QUEUE)
    @Transactional
    public void handleSanctionLifted(UserSanctionLiftedEvent event) {
        userBanRepository.deleteByUserId(event.userId());
        log.info("Ban lifted userId={}", event.userId());
    }
}
