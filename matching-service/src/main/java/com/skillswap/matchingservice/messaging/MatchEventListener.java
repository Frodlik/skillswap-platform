package com.skillswap.matchingservice.messaging;

import com.skillswap.matchingservice.config.RabbitMqConfig;
import com.skillswap.matchingservice.domain.KnownUser;
import com.skillswap.matchingservice.event.inbound.ProfileUpdatedEvent;
import com.skillswap.matchingservice.event.inbound.SessionCompletedEvent;
import com.skillswap.matchingservice.event.inbound.SkillOfferedEvent;
import com.skillswap.matchingservice.event.inbound.SkillWantedEvent;
import com.skillswap.matchingservice.event.inbound.UserRegisteredEvent;
import com.skillswap.matchingservice.repository.KnownUserRepository;
import com.skillswap.matchingservice.service.MatchingService;
import com.skillswap.matchingservice.service.RatingUpdateService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@AllArgsConstructor
public class MatchEventListener {

    private static final Logger log = LoggerFactory.getLogger(MatchEventListener.class);

    private final MatchingService matchingService;
    private final RatingUpdateService ratingUpdateService;
    private final KnownUserRepository knownUserRepository;

    @RabbitListener(queues = RabbitMqConfig.SKILL_OFFERED_QUEUE)
    public void onSkillOffered(SkillOfferedEvent event) {
        log.info("skill.offered for userId={}", event.userId());
        matchingService.recomputeForUser(event.userId());
    }

    @RabbitListener(queues = RabbitMqConfig.SKILL_WANTED_QUEUE)
    public void onSkillWanted(SkillWantedEvent event) {
        log.info("skill.wanted for userId={}", event.userId());
        matchingService.recomputeForUser(event.userId());
    }

    @RabbitListener(queues = RabbitMqConfig.PROFILE_UPDATED_QUEUE)
    public void onProfileUpdated(ProfileUpdatedEvent event) {
        log.info("user.profile.updated for userId={}", event.userId());
        matchingService.recomputeForUser(event.userId());
    }

    @RabbitListener(queues = RabbitMqConfig.USER_REGISTERED_QUEUE)
    public void onUserRegistered(UserRegisteredEvent event) {
        log.info("user.registered for userId={}", event.userId());
        knownUserRepository.save(new KnownUser(event.userId(), Instant.now()));
    }

    @RabbitListener(queues = RabbitMqConfig.SESSION_COMPLETED_QUEUE)
    public void onSessionCompleted(SessionCompletedEvent event) {
        log.info("session.completed sessionId={} teacherId={} learnerId={}",
                event.sessionId(), event.teacherId(), event.learnerId());
        ratingUpdateService.handleSessionCompleted(event);
    }
}
