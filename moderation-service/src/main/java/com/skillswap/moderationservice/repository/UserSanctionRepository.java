package com.skillswap.moderationservice.repository;

import com.skillswap.moderationservice.domain.SanctionType;
import com.skillswap.moderationservice.domain.UserSanction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface UserSanctionRepository extends JpaRepository<UserSanction, UUID> {
    List<UserSanction> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<UserSanction> findByTypeOrderByCreatedAtDesc(SanctionType type);
    List<UserSanction> findAllByOrderByCreatedAtDesc();
}
