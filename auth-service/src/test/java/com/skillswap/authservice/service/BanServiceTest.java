package com.skillswap.authservice.service;

import com.skillswap.authservice.domain.BanType;
import com.skillswap.authservice.domain.UserBan;
import com.skillswap.authservice.repository.UserBanRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BanServiceTest {

    @Mock UserBanRepository userBanRepository;
    @InjectMocks BanService banService;

    @Test
    void noRow_returnsFalse() {
        when(userBanRepository.findByUserId(any())).thenReturn(Optional.empty());
        assertThat(banService.isCurrentlyBanned(UUID.randomUUID())).isFalse();
    }

    @Test
    void permanentBan_returnsTrue() {
        UUID userId = UUID.randomUUID();
        UserBan ban = UserBan.builder().id(UUID.randomUUID()).userId(userId)
                .type(BanType.PERMANENT_BAN).build();
        when(userBanRepository.findByUserId(userId)).thenReturn(Optional.of(ban));
        assertThat(banService.isCurrentlyBanned(userId)).isTrue();
    }

    @Test
    void tempBan_active_returnsTrue() {
        UUID userId = UUID.randomUUID();
        UserBan ban = UserBan.builder().id(UUID.randomUUID()).userId(userId)
                .type(BanType.TEMP_BAN).expiresAt(Instant.now().plusSeconds(3600)).build();
        when(userBanRepository.findByUserId(userId)).thenReturn(Optional.of(ban));
        assertThat(banService.isCurrentlyBanned(userId)).isTrue();
    }

    @Test
    void tempBan_expired_returnsFalse() {
        UUID userId = UUID.randomUUID();
        UserBan ban = UserBan.builder().id(UUID.randomUUID()).userId(userId)
                .type(BanType.TEMP_BAN).expiresAt(Instant.now().minusSeconds(1)).build();
        when(userBanRepository.findByUserId(userId)).thenReturn(Optional.of(ban));
        assertThat(banService.isCurrentlyBanned(userId)).isFalse();
    }
}
