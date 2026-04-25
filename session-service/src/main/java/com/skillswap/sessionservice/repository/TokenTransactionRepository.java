package com.skillswap.sessionservice.repository;

import com.skillswap.sessionservice.domain.TokenTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TokenTransactionRepository extends JpaRepository<TokenTransaction, UUID> {
    Page<TokenTransaction> findByWalletIdOrderByCreatedAtDesc(UUID walletId, Pageable pageable);
}
