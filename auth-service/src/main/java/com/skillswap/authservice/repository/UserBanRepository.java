package com.skillswap.authservice.repository;

import com.skillswap.authservice.domain.UserBan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserBanRepository extends JpaRepository<UserBan, UUID> {
    Optional<UserBan> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
