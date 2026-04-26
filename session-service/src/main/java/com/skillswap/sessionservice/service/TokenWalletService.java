package com.skillswap.sessionservice.service;

import com.skillswap.sessionservice.domain.TokenTransaction;
import com.skillswap.sessionservice.domain.TokenWallet;
import com.skillswap.sessionservice.domain.TransactionType;
import com.skillswap.sessionservice.exception.InsufficientBalanceException;
import com.skillswap.sessionservice.exception.WalletNotFoundException;
import com.skillswap.sessionservice.repository.TokenTransactionRepository;
import com.skillswap.sessionservice.repository.TokenWalletRepository;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@AllArgsConstructor
public class TokenWalletService {

    private static final Logger log = LoggerFactory.getLogger(TokenWalletService.class);
    private static final int SIGNUP_BONUS = 4;

    private final TokenWalletRepository walletRepo;
    private final TokenTransactionRepository txRepo;

    @Transactional
    public TokenWallet createWalletWithSignupBonus(UUID userId) {
        if (walletRepo.existsByUserId(userId)) {
            log.info("Wallet already exists for userId={}, skipping signup bonus", userId);
            return walletRepo.findByUserId(userId).orElseThrow();
        }
        TokenWallet wallet = walletRepo.save(TokenWallet.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .balance(SIGNUP_BONUS)
                .heldBalance(0)
                .build());
        recordTransaction(wallet.getId(), SIGNUP_BONUS, TransactionType.CREDIT, null, "Signup bonus");
        log.info("Created wallet with signup bonus for userId={}", userId);
        return wallet;
    }

    @Transactional
    public void createWalletIfMissing(UUID userId) {
        if (walletRepo.existsByUserId(userId)) {
            return;
        }
        walletRepo.save(TokenWallet.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .balance(0)
                .heldBalance(0)
                .build());
        log.info("Created empty wallet for userId={}", userId);
    }

    @Transactional
    public void hold(UUID userId, int amount, UUID referenceId) {
        TokenWallet wallet = walletRepo.findByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException(userId));
        if (wallet.getBalance() < amount) {
            throw new InsufficientBalanceException(wallet.getBalance(), amount);
        }
        wallet.setBalance(wallet.getBalance() - amount);
        wallet.setHeldBalance(wallet.getHeldBalance() + amount);
        walletRepo.save(wallet);
        recordTransaction(wallet.getId(), amount, TransactionType.HOLD, referenceId, "Hold for session");
    }

    @Transactional
    public void release(UUID userId, int amount, UUID referenceId) {
        TokenWallet wallet = walletRepo.findByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException(userId));
        wallet.setHeldBalance(wallet.getHeldBalance() - amount);
        wallet.setBalance(wallet.getBalance() + amount);
        walletRepo.save(wallet);
        recordTransaction(wallet.getId(), amount, TransactionType.RELEASE, referenceId, "Release on cancel");
    }

    @Transactional
    public void transfer(UUID fromUserId, UUID toUserId, int amount, UUID referenceId) {
        TokenWallet from = walletRepo.findByUserId(fromUserId)
                .orElseThrow(() -> new WalletNotFoundException(fromUserId));
        TokenWallet to = walletRepo.findByUserId(toUserId)
                .orElseThrow(() -> new WalletNotFoundException(toUserId));

        from.setHeldBalance(from.getHeldBalance() - amount);
        to.setBalance(to.getBalance() + amount);
        walletRepo.save(from);
        walletRepo.save(to);

        recordTransaction(from.getId(), amount, TransactionType.TRANSFER, referenceId, "Transfer out on completion");
        recordTransaction(to.getId(),   amount, TransactionType.CREDIT,   referenceId, "Transfer in on completion");
    }

    private void recordTransaction(UUID walletId, int amount, TransactionType type, UUID referenceId, String desc) {
        txRepo.save(TokenTransaction.builder()
                .id(UUID.randomUUID())
                .walletId(walletId)
                .amount(amount)
                .type(type)
                .referenceId(referenceId)
                .description(desc)
                .build());
    }
}
