package com.skillswap.moderationservice.service;

import com.skillswap.moderationservice.domain.ContentReport;
import com.skillswap.moderationservice.domain.ContentReportStatus;
import com.skillswap.moderationservice.dto.response.ReportResponse;
import com.skillswap.moderationservice.event.SessionReportSubmittedEvent;
import com.skillswap.moderationservice.exception.ReportNotFoundException;
import com.skillswap.moderationservice.repository.ContentReportRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock ContentReportRepository reportRepo;
    @InjectMocks ReportService reportService;

    @Test
    void createFromEvent_idempotent_skipsIfSourceExists() {
        UUID sourceId = UUID.randomUUID();
        when(reportRepo.existsBySourceId(sourceId)).thenReturn(true);

        reportService.createFromEvent(new SessionReportSubmittedEvent(
                sourceId, UUID.randomUUID(), UUID.randomUUID(), "HATE_SPEECH", null));

        verify(reportRepo, never()).save(any());
    }

    @Test
    void createFromEvent_newReport_saves() {
        UUID sourceId = UUID.randomUUID();
        when(reportRepo.existsBySourceId(sourceId)).thenReturn(false);
        when(reportRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        reportService.createFromEvent(new SessionReportSubmittedEvent(
                sourceId, UUID.randomUUID(), UUID.randomUUID(), "HARASSMENT", "bad actor"));

        verify(reportRepo).save(argThat(r -> r.getSourceId().equals(sourceId)
                && r.getStatus() == ContentReportStatus.OPEN));
    }

    @Test
    void resolveReport_notFound_throwsException() {
        when(reportRepo.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reportService.resolve(UUID.randomUUID(), UUID.randomUUID()))
                .isInstanceOf(ReportNotFoundException.class);
    }

    @Test
    void resolveReport_updatesStatusAndResolver() {
        UUID reportId = UUID.randomUUID();
        UUID moderatorId = UUID.randomUUID();
        ContentReport report = openReport(reportId);

        when(reportRepo.findById(reportId)).thenReturn(Optional.of(report));
        when(reportRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ReportResponse response = reportService.resolve(reportId, moderatorId);

        assertThat(response.status()).isEqualTo(ContentReportStatus.RESOLVED);
        assertThat(response.resolvedBy()).isEqualTo(moderatorId);
    }

    @Test
    void dismissReport_updatesStatus() {
        UUID reportId = UUID.randomUUID();
        ContentReport report = openReport(reportId);

        when(reportRepo.findById(reportId)).thenReturn(Optional.of(report));
        when(reportRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ReportResponse response = reportService.dismiss(reportId, UUID.randomUUID());

        assertThat(response.status()).isEqualTo(ContentReportStatus.DISMISSED);
    }

    private ContentReport openReport(UUID id) {
        return ContentReport.builder()
                .id(id).sourceId(UUID.randomUUID())
                .reporterId(UUID.randomUUID()).reportedUserId(UUID.randomUUID())
                .reason("HARASSMENT").status(ContentReportStatus.OPEN).build();
    }
}
