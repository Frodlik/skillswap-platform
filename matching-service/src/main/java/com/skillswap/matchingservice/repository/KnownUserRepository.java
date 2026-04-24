package com.skillswap.matchingservice.repository;

import com.skillswap.matchingservice.domain.KnownUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface KnownUserRepository extends JpaRepository<KnownUser, UUID> {

    @Query("SELECT k.id FROM KnownUser k")
    List<UUID> findAllIds();
}
