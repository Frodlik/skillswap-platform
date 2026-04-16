package com.skillswap.authservice.repository;

import com.skillswap.authservice.domain.Credentials;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CredentialsRepository extends JpaRepository<Credentials, UUID> {

    Optional<Credentials> findByEmail(String email);

    boolean existsByEmail(String email);
}