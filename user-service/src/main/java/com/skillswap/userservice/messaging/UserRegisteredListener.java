package com.skillswap.userservice.messaging;

import com.skillswap.userservice.config.RabbitMqConfig;
import com.skillswap.userservice.event.UserRegisteredEvent;
import com.skillswap.userservice.service.ProfileService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class UserRegisteredListener {

    private static final Logger log = LoggerFactory.getLogger(UserRegisteredListener.class);

    private final ProfileService profileService;

    @RabbitListener(queues = RabbitMqConfig.USER_REGISTERED_QUEUE)
    public void onUserRegistered(UserRegisteredEvent event) {
        log.info("Received user.registered for userId={}", event.userId());
        profileService.createProfileFromEvent(event);
    }
}
