package com.skillswap.sessionservice.controller;

import com.skillswap.sessionservice.domain.TokenWallet;
import com.skillswap.sessionservice.dto.request.CreateSessionRequest;
import com.skillswap.sessionservice.dto.request.RespondToProposalRequest;
import com.skillswap.sessionservice.dto.request.ReviewRequest;
import com.skillswap.sessionservice.dto.request.SubmitReportRequest;
import com.skillswap.sessionservice.dto.request.UpdateStatusRequest;
import com.skillswap.sessionservice.dto.response.BusySlotResponse;
import com.skillswap.sessionservice.dto.response.ReportResponse;
import com.skillswap.sessionservice.dto.response.ReviewResponse;
import com.skillswap.sessionservice.dto.response.RoomResponse;
import com.skillswap.sessionservice.dto.response.SessionResponse;
import com.skillswap.sessionservice.dto.response.TransactionResponse;
import com.skillswap.sessionservice.dto.response.WalletBalanceResponse;
import com.skillswap.sessionservice.exception.WalletNotFoundException;
import com.skillswap.sessionservice.repository.TokenTransactionRepository;
import com.skillswap.sessionservice.repository.TokenWalletRepository;
import com.skillswap.sessionservice.service.ReportService;
import com.skillswap.sessionservice.service.ReviewService;
import com.skillswap.sessionservice.service.SessionService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sessions")
@AllArgsConstructor
@Tag(name = "Session", description = "Session lifecycle, token wallet, transactions, reviews")
@SecurityRequirement(name = "bearerAuth")
public class SessionController {

    private final SessionService sessionService;
    private final ReviewService reviewService;
    private final ReportService reportService;
    private final TokenWalletRepository walletRepo;
    private final TokenTransactionRepository txRepo;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    SessionResponse create(@Valid @RequestBody CreateSessionRequest req) {
        return sessionService.createSession(req);
    }

    @GetMapping("/{sessionId}")
    SessionResponse get(@PathVariable UUID sessionId) {
        return sessionService.getSession(sessionId);
    }

    @GetMapping("/{sessionId}/room")
    RoomResponse room(@PathVariable UUID sessionId) {
        return sessionService.getRoom(sessionId);
    }

    @PatchMapping("/{sessionId}/status")
    SessionResponse updateStatus(@PathVariable UUID sessionId,
                                 @Valid @RequestBody UpdateStatusRequest req) {
        return sessionService.changeStatus(sessionId, req.status());
    }

    // Consent flow: invitee accepts or declines a PROPOSED session.
    // The proposer cannot use these endpoints — they would need /status
    // with CANCELLED to walk away from their own invitation.
    @PostMapping("/{sessionId}/accept")
    SessionResponse acceptProposal(@PathVariable UUID sessionId,
                                   @Valid @RequestBody RespondToProposalRequest req) {
        return sessionService.acceptProposal(sessionId, req.actorId());
    }

    @PostMapping("/{sessionId}/decline")
    SessionResponse declineProposal(@PathVariable UUID sessionId,
                                    @Valid @RequestBody RespondToProposalRequest req) {
        return sessionService.declineProposal(sessionId, req.actorId());
    }

    @PostMapping("/{sessionId}/review")
    @ResponseStatus(HttpStatus.CREATED)
    ReviewResponse review(@PathVariable UUID sessionId,
                          @Valid @RequestBody ReviewRequest req) {
        return reviewService.submitReview(sessionId, req);
    }

    @PostMapping("/{sessionId}/report")
    @ResponseStatus(HttpStatus.CREATED)
    ReportResponse report(@PathVariable UUID sessionId,
                          @Valid @RequestBody SubmitReportRequest req) {
        return reportService.submitReport(sessionId, req);
    }

    @GetMapping("/user/{userId}")
    Page<SessionResponse> userSessions(@PathVariable UUID userId,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        return sessionService.getUserSessions(userId, PageRequest.of(page, size));
    }

    @GetMapping("/user/{userId}/busy")
    List<BusySlotResponse> userBusySlots(@PathVariable UUID userId,
                                         @RequestParam Instant from,
                                         @RequestParam Instant to) {
        return sessionService.getBusySlots(userId, from, to);
    }

    @GetMapping("/user/{userId}/balance")
    WalletBalanceResponse balance(@PathVariable UUID userId) {
        var wallet = walletRepo.findByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException(userId));
        return new WalletBalanceResponse(userId, wallet.getBalance(),
                wallet.getHeldBalance(), wallet.getBalance() + wallet.getHeldBalance());
    }

    @GetMapping("/user/{userId}/transactions")
    Page<TransactionResponse> transactions(@PathVariable UUID userId,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        TokenWallet wallet = walletRepo.findByUserId(userId)
                .orElseThrow(() -> new WalletNotFoundException(userId));
        Pageable pageable = PageRequest.of(page, size);
        return txRepo.findByWalletIdOrderByCreatedAtDesc(wallet.getId(), pageable)
                .map(t -> new TransactionResponse(t.getId(), t.getWalletId(), t.getAmount(),
                        t.getType(), t.getReferenceId(), t.getDescription(), t.getCreatedAt()));
    }
}
