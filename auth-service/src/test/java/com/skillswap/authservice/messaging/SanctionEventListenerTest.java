package com.skillswap.authservice.messaging;

import com.skillswap.authservice.domain.BanType;
import com.skillswap.authservice.domain.UserBan;
import com.skillswap.authservice.event.UserSanctionLiftedEvent;
import com.skillswap.authservice.event.UserSanctionedEvent;
import com.skillswap.authservice.repository.UserBanRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SanctionEventListenerTest {

    @Mock UserBanRepository userBanRepository;
    @InjectMocks SanctionEventListener listener;

    @Test
    void warningType_doesNotCreateBan() {
        listener.handleSanctioned(new UserSanctionedEvent(UUID.randomUUID(), "WARNING", null));
        verify(userBanRepository, never()).save(any());
        verify(userBanRepository, never()).deleteByUserId(any());
    }

    @Test
    void permanentBan_savesRecord() {
        UUID userId = UUID.randomUUID();
        listener.handleSanctioned(new UserSanctionedEvent(userId, "PERMANENT_BAN", null));

        verify(userBanRepository).deleteByUserId(userId);
        ArgumentCaptor<UserBan> captor = ArgumentCaptor.forClass(UserBan.class);
        verify(userBanRepository).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo(userId);
        assertThat(captor.getValue().getType()).isEqualTo(BanType.PERMANENT_BAN);
        assertThat(captor.getValue().getExpiresAt()).isNull();
    }

    @Test
    void tempBan_savesRecordWithExpiry() {
        UUID userId = UUID.randomUUID();
        Instant expiresAt = Instant.now().plusSeconds(86400);
        listener.handleSanctioned(new UserSanctionedEvent(userId, "TEMP_BAN", expiresAt));

        ArgumentCaptor<UserBan> captor = ArgumentCaptor.forClass(UserBan.class);
        verify(userBanRepository).save(captor.capture());
        assertThat(captor.getValue().getType()).isEqualTo(BanType.TEMP_BAN);
        assertThat(captor.getValue().getExpiresAt()).isEqualTo(expiresAt);
    }

    @Test
    void sanctionLifted_deletesBan() {
        UUID userId = UUID.randomUUID();
        listener.handleSanctionLifted(new UserSanctionLiftedEvent(userId));
        verify(userBanRepository).deleteByUserId(userId);
        verify(userBanRepository, never()).save(any());
    }
}
