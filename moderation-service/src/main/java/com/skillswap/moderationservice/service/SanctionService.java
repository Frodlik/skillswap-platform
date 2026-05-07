package com.skillswap.moderationservice.service;

import com.skillswap.moderationservice.domain.SanctionType;
import com.skillswap.moderationservice.domain.UserSanction;
import com.skillswap.moderationservice.dto.request.CreateSanctionRequest;
import com.skillswap.moderationservice.dto.response.SanctionResponse;
import com.skillswap.moderationservice.exception.SanctionNotFoundException;
import com.skillswap.moderationservice.messaging.SanctionEventPublisher;
import com.skillswap.moderationservice.repository.UserSanctionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class SanctionService {

    private final UserSanctionRepository sanctionRepo;
    private final SanctionEventPublisher eventPublisher;

    @Transactional
    public SanctionResponse create(CreateSanctionRequest request, UUID moderatorId) {
        if (request.type() == SanctionType.TEMP_BAN && request.expiresAt() == null) {
            throw new IllegalArgumentException("expiresAt is required for TEMP_BAN");
        }
        UserSanction sanction = UserSanction.builder()
                .id(UUID.randomUUID())
                .userId(request.userId())
                .type(request.type())
                .reason(request.reason())
                .expiresAt(request.expiresAt())
                .createdBy(moderatorId)
                .build();
        UserSanction saved = sanctionRepo.save(sanction);

        if (request.type() != SanctionType.WARNING) {
            eventPublisher.publishSanctioned(saved.getUserId(),
                    saved.getType().name(), saved.getExpiresAt());
        }
        return toResponse(saved);
    }

    @Transactional
    public SanctionResponse lift(UUID sanctionId, UUID moderatorId) {
        UserSanction sanction = sanctionRepo.findById(sanctionId)
                .orElseThrow(() -> new SanctionNotFoundException(sanctionId));
        if (sanction.getLiftedAt() != null) {
            throw new IllegalStateException("Sanction already lifted");
        }
        sanction.setLiftedAt(Instant.now());
        sanction.setLiftedBy(moderatorId);
        UserSanction saved = sanctionRepo.save(sanction);

        if (sanction.getType() != SanctionType.WARNING) {
            eventPublisher.publishSanctionLifted(saved.getUserId());
        }
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SanctionResponse> list(UUID userId, SanctionType type) {
        if (userId != null) {
            return sanctionRepo.findByUserIdOrderByCreatedAtDesc(userId)
                    .stream().map(this::toResponse).toList();
        }
        if (type != null) {
            return sanctionRepo.findByTypeOrderByCreatedAtDesc(type)
                    .stream().map(this::toResponse).toList();
        }
        return sanctionRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    private SanctionResponse toResponse(UserSanction s) {
        return new SanctionResponse(s.getId(), s.getUserId(), s.getType(), s.getReason(),
                s.getExpiresAt(), s.getCreatedBy(), s.getCreatedAt(),
                s.getLiftedAt(), s.getLiftedBy());
    }
}
