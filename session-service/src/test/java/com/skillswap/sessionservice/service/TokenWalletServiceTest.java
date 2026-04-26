package com.skillswap.sessionservice.service;

import com.skillswap.sessionservice.domain.TokenTransaction;
import com.skillswap.sessionservice.domain.TokenWallet;
import com.skillswap.sessionservice.domain.TransactionType;
import com.skillswap.sessionservice.exception.InsufficientBalanceException;
import com.skillswap.sessionservice.exception.WalletNotFoundException;
import com.skillswap.sessionservice.repository.TokenTransactionRepository;
import com.skillswap.sessionservice.repository.TokenWalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TokenWalletServiceTest {

    @Mock TokenWalletRepository walletRepo;
    @Mock TokenTransactionRepository txRepo;

    @InjectMocks TokenWalletService service;

    UUID userId;
    UUID teacherId;
    UUID sessionId;

    @BeforeEach
    void init() {
        userId = UUID.randomUUID();
        teacherId = UUID.randomUUID();
        sessionId = UUID.randomUUID();
    }

    @Test
    void createWalletWithSignupBonus_setsBalanceTo4AndWritesCreditTransaction() {
        when(walletRepo.existsByUserId(userId)).thenReturn(false);
        when(walletRepo.save(any(TokenWallet.class))).thenAnswer(inv -> inv.getArgument(0));

        service.createWalletWithSignupBonus(userId);

        ArgumentCaptor<TokenWallet> wc = ArgumentCaptor.forClass(TokenWallet.class);
        verify(walletRepo).save(wc.capture());
        assertThat(wc.getValue().getBalance()).isEqualTo(4);
        assertThat(wc.getValue().getHeldBalance()).isZero();

        ArgumentCaptor<TokenTransaction> tc = ArgumentCaptor.forClass(TokenTransaction.class);
        verify(txRepo).save(tc.capture());
        assertThat(tc.getValue().getType()).isEqualTo(TransactionType.CREDIT);
        assertThat(tc.getValue().getAmount()).isEqualTo(4);
    }

    @Test
    void createWalletIfMissing_doesNothingWhenExists() {
        when(walletRepo.existsByUserId(userId)).thenReturn(true);

        service.createWalletIfMissing(userId);

        verify(walletRepo, times(0)).save(any());
        verify(txRepo, times(0)).save(any());
    }

    @Test
    void hold_movesAmountFromBalanceToHeldAndWritesHoldTransaction() {
        TokenWallet wallet = TokenWallet.builder()
                .id(UUID.randomUUID()).userId(userId).balance(10).heldBalance(0).build();
        when(walletRepo.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(walletRepo.save(any(TokenWallet.class))).thenAnswer(inv -> inv.getArgument(0));

        service.hold(userId, 3, sessionId);

        assertThat(wallet.getBalance()).isEqualTo(7);
        assertThat(wallet.getHeldBalance()).isEqualTo(3);
        ArgumentCaptor<TokenTransaction> tc = ArgumentCaptor.forClass(TokenTransaction.class);
        verify(txRepo).save(tc.capture());
        assertThat(tc.getValue().getType()).isEqualTo(TransactionType.HOLD);
        assertThat(tc.getValue().getAmount()).isEqualTo(3);
        assertThat(tc.getValue().getReferenceId()).isEqualTo(sessionId);
    }

    @Test
    void hold_throwsWhenBalanceInsufficient() {
        TokenWallet wallet = TokenWallet.builder()
                .id(UUID.randomUUID()).userId(userId).balance(1).heldBalance(0).build();
        when(walletRepo.findByUserId(userId)).thenReturn(Optional.of(wallet));

        assertThatThrownBy(() -> service.hold(userId, 5, sessionId))
                .isInstanceOf(InsufficientBalanceException.class);
        verify(walletRepo, times(0)).save(any());
        verify(txRepo, times(0)).save(any());
    }

    @Test
    void hold_throwsWalletNotFoundWhenMissing() {
        when(walletRepo.findByUserId(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.hold(userId, 1, sessionId))
                .isInstanceOf(WalletNotFoundException.class);
    }

    @Test
    void release_movesAmountFromHeldBackToBalanceAndWritesReleaseTransaction() {
        TokenWallet wallet = TokenWallet.builder()
                .id(UUID.randomUUID()).userId(userId).balance(7).heldBalance(3).build();
        when(walletRepo.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(walletRepo.save(any(TokenWallet.class))).thenAnswer(inv -> inv.getArgument(0));

        service.release(userId, 3, sessionId);

        assertThat(wallet.getBalance()).isEqualTo(10);
        assertThat(wallet.getHeldBalance()).isZero();
        ArgumentCaptor<TokenTransaction> tc = ArgumentCaptor.forClass(TokenTransaction.class);
        verify(txRepo).save(tc.capture());
        assertThat(tc.getValue().getType()).isEqualTo(TransactionType.RELEASE);
    }

    @Test
    void transfer_debitsHeldFromLearnerAndCreditsTeacherWritesTwoTransactions() {
        TokenWallet learnerWallet = TokenWallet.builder()
                .id(UUID.randomUUID()).userId(userId).balance(7).heldBalance(3).build();
        TokenWallet teacherWallet = TokenWallet.builder()
                .id(UUID.randomUUID()).userId(teacherId).balance(0).heldBalance(0).build();

        when(walletRepo.findByUserId(userId)).thenReturn(Optional.of(learnerWallet));
        when(walletRepo.findByUserId(teacherId)).thenReturn(Optional.of(teacherWallet));
        when(walletRepo.save(any(TokenWallet.class))).thenAnswer(inv -> inv.getArgument(0));

        service.transfer(userId, teacherId, 3, sessionId);

        assertThat(learnerWallet.getHeldBalance()).isZero();
        assertThat(learnerWallet.getBalance()).isEqualTo(7);
        assertThat(teacherWallet.getBalance()).isEqualTo(3);
        verify(txRepo, times(2)).save(any(TokenTransaction.class));
    }
}
