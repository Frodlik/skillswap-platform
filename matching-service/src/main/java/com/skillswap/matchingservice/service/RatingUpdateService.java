package com.skillswap.matchingservice.service;

import com.skillswap.matchingservice.client.UserServiceClient;
import com.skillswap.matchingservice.event.inbound.SessionCompletedEvent;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@AllArgsConstructor
public class RatingUpdateService {

    private static final Logger log = LoggerFactory.getLogger(RatingUpdateService.class);

    private final UserServiceClient userServiceClient;

    public void handleSessionCompleted(SessionCompletedEvent event) {
        if (event.ratingForTeacher() != null) {
            BigDecimal rating = BigDecimal.valueOf(event.ratingForTeacher());
            userServiceClient.updateRating(event.teacherId(), rating);
            log.info("Updated rating for teacherId={} to {}", event.teacherId(), rating);
        }
        if (event.ratingForLearner() != null) {
            BigDecimal rating = BigDecimal.valueOf(event.ratingForLearner());
            userServiceClient.updateRating(event.learnerId(), rating);
            log.info("Updated rating for learnerId={} to {}", event.learnerId(), rating);
        }
    }
}
