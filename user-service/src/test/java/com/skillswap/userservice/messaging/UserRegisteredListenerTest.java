package com.skillswap.userservice.messaging;

import com.skillswap.userservice.event.UserRegisteredEvent;
import com.skillswap.userservice.service.ProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserRegisteredListenerTest {

    @Mock ProfileService profileService;

    private UserRegisteredListener listener;

    @BeforeEach
    void setUp() {
        listener = new UserRegisteredListener(profileService);
    }

    @Test
    void onUserRegistered_delegatesToProfileService() {
        UUID userId = UUID.randomUUID();
        UserRegisteredEvent event = new UserRegisteredEvent(userId, "john@example.com", Instant.now());

        listener.onUserRegistered(event);

        verify(profileService).createProfileFromEvent(event);
    }
}
