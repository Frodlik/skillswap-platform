package com.skillswap.moderationservice.service;

import com.skillswap.moderationservice.domain.SanctionType;
import com.skillswap.moderationservice.domain.UserSanction;
import com.skillswap.moderationservice.dto.request.CreateSanctionRequest;
import com.skillswap.moderationservice.dto.response.SanctionResponse;
import com.skillswap.moderationservice.exception.SanctionNotFoundException;
import com.skillswap.moderationservice.messaging.SanctionEventPublisher;
import com.skillswap.moderationservice.repository.UserSanctionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SanctionServiceTest {

    @Mock UserSanctionRepository sanctionRepo;
    @Mock SanctionEventPublisher eventPublisher;
    @InjectMocks SanctionService sanctionService;

    @Test
    void createSanction_tempBan_savesAndPublishesEvent() {
        UUID userId = UUID.randomUUID();
        UUID moderatorId = UUID.randomUUID();
        Instant expiresAt = Instant.now().plusSeconds(86400);

        CreateSanctionRequest req = new CreateSanctionRequest(
                userId, SanctionType.TEMP_BAN, "Hate speech", expiresAt);

        when(sanctionRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SanctionResponse response = sanctionService.create(req, moderatorId);

        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.type()).isEqualTo(SanctionType.TEMP_BAN);
        verify(eventPublisher).publishSanctioned(eq(userId), eq("TEMP_BAN"), eq(expiresAt));
    }

    @Test
    void createSanction_warning_doesNotPublishEvent() {
        UUID userId = UUID.randomUUID();
        CreateSanctionRequest req = new CreateSanctionRequest(
                userId, SanctionType.WARNING, "Minor violation", null);

        when(sanctionRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        sanctionService.create(req, UUID.randomUUID());

        verify(eventPublisher, never()).publishSanctioned(any(), any(), any());
    }

    @Test
    void liftSanction_notFound_throwsException() {
        when(sanctionRepo.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sanctionService.lift(UUID.randomUUID(), UUID.randomUUID()))
                .isInstanceOf(SanctionNotFoundException.class);
    }

    @Test
    void liftSanction_alreadyLifted_throwsException() {
        UserSanction sanction = UserSanction.builder()
                .id(UUID.randomUUID()).userId(UUID.randomUUID())
                .type(SanctionType.TEMP_BAN).reason("test")
                .createdBy(UUID.randomUUID()).liftedAt(Instant.now()).build();

        when(sanctionRepo.findById(any())).thenReturn(Optional.of(sanction));

        assertThatThrownBy(() -> sanctionService.lift(sanction.getId(), UUID.randomUUID()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already lifted");
    }

    @Test
    void liftSanction_permBan_updatesAndPublishesEvent() {
        UUID userId = UUID.randomUUID();
        UserSanction sanction = UserSanction.builder()
                .id(UUID.randomUUID()).userId(userId)
                .type(SanctionType.PERMANENT_BAN).reason("test")
                .createdBy(UUID.randomUUID()).build();

        when(sanctionRepo.findById(sanction.getId())).thenReturn(Optional.of(sanction));
        when(sanctionRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        sanctionService.lift(sanction.getId(), UUID.randomUUID());

        assertThat(sanction.getLiftedAt()).isNotNull();
        verify(eventPublisher).publishSanctionLifted(userId);
    }
}
