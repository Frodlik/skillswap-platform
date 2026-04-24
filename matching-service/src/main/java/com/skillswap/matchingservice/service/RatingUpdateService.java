package com.skillswap.matchingservice.service;

import com.skillswap.matchingservice.client.UserServiceClient;
import com.skillswap.matchingservice.event.inbound.SessionCompletedEvent;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class RatingUpdateService {

    private static final Logger log = LoggerFactory.getLogger(RatingUpdateService.class);

    private final UserServiceClient userServiceClient;

    public void handleSessionCompleted(SessionCompletedEvent event) {
        if (event.ratingForA() != null) {
            userServiceClient.updateRating(event.userAId(), event.ratingForA());
            log.info("Updated rating for userA={} to {}", event.userAId(), event.ratingForA());
        }
        if (event.ratingForB() != null) {
            userServiceClient.updateRating(event.userBId(), event.ratingForB());
            log.info("Updated rating for userB={} to {}", event.userBId(), event.ratingForB());
        }
    }
}
