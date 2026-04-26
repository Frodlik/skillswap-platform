package com.skillswap.sessionservice.integration;

import com.skillswap.sessionservice.domain.TokenWallet;
import com.skillswap.sessionservice.domain.TransactionType;
import com.skillswap.sessionservice.exception.InsufficientBalanceException;
import com.skillswap.sessionservice.repository.TokenTransactionRepository;
import com.skillswap.sessionservice.repository.TokenWalletRepository;
import com.skillswap.sessionservice.service.TokenWalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
class TokenWalletIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine").withDatabaseName("session_test");

    @Container
    static RabbitMQContainer rabbitmq = new RabbitMQContainer("rabbitmq:3-management");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.rabbitmq.host", rabbitmq::getHost);
        registry.add("spring.rabbitmq.port", rabbitmq::getAmqpPort);
        registry.add("eureka.client.enabled", () -> "false");
        registry.add("spring.cloud.discovery.enabled", () -> "false");
    }

    @Autowired
    TokenWalletService service;

    @Autowired
    TokenWalletRepository walletRepo;

    @Autowired
    TokenTransactionRepository txRepo;

    @BeforeEach
    void cleanUp() {
        txRepo.deleteAll();
        walletRepo.deleteAll();
    }

    @Test
    void signupBonus_persistsBalance4AndCreditTransaction() {
        UUID userId = UUID.randomUUID();
        TokenWallet wallet = service.createWalletWithSignupBonus(userId);

        assertThat(wallet.getBalance()).isEqualTo(4);
        assertThat(wallet.getHeldBalance()).isEqualTo(0);

        var page = txRepo.findByWalletIdOrderByCreatedAtDesc(wallet.getId(), PageRequest.of(0, 10));
        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getType()).isEqualTo(TransactionType.CREDIT);
        assertThat(page.getContent().get(0).getAmount()).isEqualTo(4);
    }

    @Test
    void holdAndTransfer_endsWithBalanceMovedToTeacher() {
        UUID learner = UUID.randomUUID();
        UUID teacher = UUID.randomUUID();
        UUID ref = UUID.randomUUID();

        service.createWalletWithSignupBonus(learner);
        service.createWalletWithSignupBonus(teacher);

        service.hold(learner, 2, ref);
        service.transfer(learner, teacher, 2, ref);

        TokenWallet learnerWallet = walletRepo.findByUserId(learner).orElseThrow();
        TokenWallet teacherWallet = walletRepo.findByUserId(teacher).orElseThrow();

        assertThat(learnerWallet.getBalance()).isEqualTo(2);
        assertThat(learnerWallet.getHeldBalance()).isEqualTo(0);
        assertThat(teacherWallet.getBalance()).isEqualTo(6);
        assertThat(teacherWallet.getHeldBalance()).isEqualTo(0);
    }

    @Test
    void holdAndRelease_returnsHeldToBalance() {
        UUID learner = UUID.randomUUID();
        UUID ref = UUID.randomUUID();

        service.createWalletWithSignupBonus(learner);
        service.hold(learner, 3, ref);
        service.release(learner, 3, ref);

        TokenWallet wallet = walletRepo.findByUserId(learner).orElseThrow();
        assertThat(wallet.getBalance()).isEqualTo(4);
        assertThat(wallet.getHeldBalance()).isEqualTo(0);
    }

    @Test
    void hold_failsWithInsufficientBalance() {
        UUID learner = UUID.randomUUID();
        UUID ref = UUID.randomUUID();

        service.createWalletWithSignupBonus(learner);

        assertThatThrownBy(() -> service.hold(learner, 5, ref))
                .isInstanceOf(InsufficientBalanceException.class);
    }

    @Test
    void concurrentHolds_atLeastOneOptimisticLockingFailureRecorded() throws Exception {
        UUID learner = UUID.randomUUID();
        service.createWalletWithSignupBonus(learner);
        TokenWallet wallet = walletRepo.findByUserId(learner).orElseThrow();
        wallet.setBalance(8);
        walletRepo.save(wallet);

        int threads = 8;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threads);
        AtomicInteger successes = new AtomicInteger();
        AtomicInteger failures = new AtomicInteger();

        for (int i = 0; i < threads; i++) {
            pool.submit(() -> {
                try {
                    start.await();
                    service.hold(learner, 1, UUID.randomUUID());
                    successes.incrementAndGet();
                } catch (Exception e) {
                    failures.incrementAndGet();
                } finally {
                    done.countDown();
                }
            });
        }
        start.countDown();
        done.await(30, TimeUnit.SECONDS);
        pool.shutdown();

        assertThat(successes.get() + failures.get()).isEqualTo(threads);
        assertThat(failures.get()).isGreaterThanOrEqualTo(1);

        TokenWallet finalWallet = walletRepo.findByUserId(learner).orElseThrow();
        assertThat(finalWallet.getBalance()).isEqualTo(8 - successes.get());
        assertThat(finalWallet.getHeldBalance()).isEqualTo(successes.get());
    }
}
