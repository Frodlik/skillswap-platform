package com.skillswap.sessionservice.repository;

import com.skillswap.sessionservice.domain.TokenWallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TokenWalletRepository extends JpaRepository<TokenWallet, UUID> {
    Optional<TokenWallet> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
}
