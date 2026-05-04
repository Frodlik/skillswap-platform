package com.skillswap.sessionservice.service;

import com.skillswap.sessionservice.domain.Session;
import com.skillswap.sessionservice.domain.SessionReport;
import com.skillswap.sessionservice.domain.SessionStatus;
import com.skillswap.sessionservice.dto.request.SubmitReportRequest;
import com.skillswap.sessionservice.dto.response.ReportResponse;
import com.skillswap.sessionservice.exception.DuplicateReportException;
import com.skillswap.sessionservice.exception.SessionNotFoundException;
import com.skillswap.sessionservice.repository.SessionRepository;
import com.skillswap.sessionservice.repository.SessionReportRepository;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

// Trust & Safety: stores user-submitted reports about session participants.
// Mirrors ReviewService — same uniqueness model (one row per session+reporter)
// and same "reporter must be a participant" check, but with a free-form
// reason enum instead of a 1-5 rating.
//
// We deliberately do NOT record the call (privacy + GDPR + storage cost) —
// see docs/frontend-guide.md §10 for the trade-off discussion. Instead we
// rely on user-driven reports + (future) admin moderation queue.
@Service
@AllArgsConstructor
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);

    private final SessionReportRepository reportRepo;
    private final SessionRepository sessionRepo;

    @Transactional
    public ReportResponse submitReport(UUID sessionId, SubmitReportRequest req) {
        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException(sessionId));

        // Reporter must be a participant of this session.
        boolean isTeacher = req.reporterId().equals(session.getTeacherId());
        boolean isLearner = req.reporterId().equals(session.getLearnerId());
        if (!isTeacher && !isLearner) {
            throw new IllegalArgumentException(
                    "Reporter is not a participant of session " + sessionId);
        }

        // Reports allowed only on finished sessions — prevents reporting an
        // ongoing session out of frustration before it's even concluded.
        SessionStatus status = session.getStatus();
        if (status != SessionStatus.COMPLETED && status != SessionStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Cannot report a session in status " + status
                            + " — wait until it is COMPLETED or CANCELLED");
        }

        if (reportRepo.existsBySessionIdAndReporterId(sessionId, req.reporterId())) {
            throw new DuplicateReportException(sessionId, req.reporterId());
        }

        // Reported user is the OTHER participant — derived, not from the body,
        // so a malicious client can't attribute a report to the wrong person.
        UUID reportedUserId = isTeacher ? session.getLearnerId() : session.getTeacherId();

        SessionReport saved = reportRepo.save(SessionReport.builder()
                .id(UUID.randomUUID())
                .sessionId(sessionId)
                .reporterId(req.reporterId())
                .reportedUserId(reportedUserId)
                .reason(req.reason())
                .comment(req.comment())
                .resolved(false)
                .build());

        long total = reportRepo.countByReportedUserId(reportedUserId);
        log.warn("Report submitted: session={} reporter={} reported={} reason={} totalAgainstUser={}",
                sessionId, req.reporterId(), reportedUserId, req.reason(), total);

        // TODO Phase 6+: when total >= 3, publish "user.flagged" event so the
        // user-service can mark the account for moderator review and the
        // matching-service can apply a penalty in scoring.

        return toResponse(saved);
    }

    private ReportResponse toResponse(SessionReport r) {
        return new ReportResponse(r.getId(), r.getSessionId(), r.getReporterId(),
                r.getReportedUserId(), r.getReason(), r.getComment(),
                r.getCreatedAt(), r.isResolved());
    }
}
