package com.skillswap.userservice.repository;

import com.skillswap.userservice.domain.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, UUID> {

    Optional<UserPreference> findByUserId(UUID userId);
}
