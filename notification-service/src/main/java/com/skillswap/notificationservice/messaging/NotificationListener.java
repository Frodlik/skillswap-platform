package com.skillswap.notificationservice.messaging;

import com.skillswap.notificationservice.config.RabbitMqConfig;
import com.skillswap.notificationservice.event.MatchAcceptedEvent;
import com.skillswap.notificationservice.event.MatchFoundEvent;
import com.skillswap.notificationservice.event.SessionCompletedEvent;
import com.skillswap.notificationservice.event.UserRegisteredEvent;
import com.skillswap.notificationservice.service.EmailDirectory;
import com.skillswap.notificationservice.service.EmailService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
@AllArgsConstructor
public class NotificationListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationListener.class);

    private final EmailDirectory emailDirectory;
    private final EmailService emailService;

    @RabbitListener(queues = RabbitMqConfig.USER_REGISTERED_QUEUE)
    public void onUserRegistered(UserRegisteredEvent event) {
        log.info("user.registered userId={} email={}", event.userId(), event.email());
        emailDirectory.put(event.userId(), event.email());
        emailService.send(
                event.email(),
                "Welcome to SkillSwap!",
                "welcome",
                Map.of("email", event.email())
        );
    }

    @RabbitListener(queues = RabbitMqConfig.MATCH_FOUND_QUEUE)
    public void onMatchFound(MatchFoundEvent event) {
        log.info("match.found matchId={} score={}", event.matchId(), event.totalScore());
        // Notify both sides — they each see the other as a candidate now.
        notifyOne(event.userAId(), "You have a new match on SkillSwap",
                "match-found", Map.of("score", String.format("%.0f%%", event.totalScore() * 100)));
        notifyOne(event.userBId(), "You have a new match on SkillSwap",
                "match-found", Map.of("score", String.format("%.0f%%", event.totalScore() * 100)));
    }

    @RabbitListener(queues = RabbitMqConfig.MATCH_ACCEPTED_QUEUE)
    public void onMatchAccepted(MatchAcceptedEvent event) {
        log.info("match.accepted matchId={}", event.matchId());
        notifyOne(event.userAId(), "Match accepted — schedule your session",
                "match-accepted", Map.of());
        notifyOne(event.userBId(), "Match accepted — schedule your session",
                "match-accepted", Map.of());
    }

    @RabbitListener(queues = RabbitMqConfig.SESSION_COMPLETED_QUEUE)
    public void onSessionCompleted(SessionCompletedEvent event) {
        log.info("session.completed sessionId={}", event.sessionId());
        notifyOne(event.teacherId(), "Session completed — leave a review",
                "session-completed", Map.of("role", "teacher"));
        notifyOne(event.learnerId(), "Session completed — leave a review",
                "session-completed", Map.of("role", "learner"));
    }

    // Looks up email in cache and dispatches; logs (without sending) when
    // the user is unknown to us — typical right after a cold restart, before
    // any user.registered events are replayed.
    private void notifyOne(UUID userId, String subject, String template, Map<String, Object> model) {
        Optional<String> email = emailDirectory.find(userId);
        if (email.isEmpty()) {
            log.warn("No cached email for userId={} — skipping '{}'", userId, subject);
            return;
        }
        emailService.send(email.get(), subject, template, model);
    }
}
