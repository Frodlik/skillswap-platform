package com.skillswap.moderationservice.service;

import com.skillswap.moderationservice.domain.ContentReport;
import com.skillswap.moderationservice.domain.ContentReportStatus;
import com.skillswap.moderationservice.dto.response.ReportResponse;
import com.skillswap.moderationservice.event.SessionReportSubmittedEvent;
import com.skillswap.moderationservice.exception.ReportNotFoundException;
import com.skillswap.moderationservice.repository.ContentReportRepository;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);
    private final ContentReportRepository reportRepo;

    @Transactional
    public void createFromEvent(SessionReportSubmittedEvent event) {
        if (reportRepo.existsBySourceId(event.sessionReportId())) {
            return;
        }
        ContentReport report = ContentReport.builder()
                .id(UUID.randomUUID())
                .sourceId(event.sessionReportId())
                .reporterId(event.reporterId())
                .reportedUserId(event.reportedUserId())
                .reason(event.reason())
                .comment(event.comment())
                .status(ContentReportStatus.OPEN)
                .build();
        reportRepo.save(report);
        log.info("Created content report sourceId={} reportedUser={}",
                event.sessionReportId(), event.reportedUserId());
    }

    @Transactional
    public ReportResponse resolve(UUID reportId, UUID moderatorId) {
        ContentReport report = reportRepo.findById(reportId)
                .orElseThrow(() -> new ReportNotFoundException(reportId));
        report.setStatus(ContentReportStatus.RESOLVED);
        report.setResolvedBy(moderatorId);
        report.setResolvedAt(Instant.now());
        return toResponse(reportRepo.save(report));
    }

    @Transactional
    public ReportResponse dismiss(UUID reportId, UUID moderatorId) {
        ContentReport report = reportRepo.findById(reportId)
                .orElseThrow(() -> new ReportNotFoundException(reportId));
        report.setStatus(ContentReportStatus.DISMISSED);
        report.setResolvedBy(moderatorId);
        report.setResolvedAt(Instant.now());
        return toResponse(reportRepo.save(report));
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> list(ContentReportStatus status) {
        return (status != null
                ? reportRepo.findByStatusOrderByCreatedAtDesc(status)
                : reportRepo.findAllByOrderByCreatedAtDesc())
                .stream().map(this::toResponse).toList();
    }

    private ReportResponse toResponse(ContentReport r) {
        return new ReportResponse(r.getId(), r.getSourceId(), r.getReporterId(),
                r.getReportedUserId(), r.getReason(), r.getComment(), r.getStatus(),
                r.getResolvedBy(), r.getResolvedAt(), r.getCreatedAt());
    }
}
