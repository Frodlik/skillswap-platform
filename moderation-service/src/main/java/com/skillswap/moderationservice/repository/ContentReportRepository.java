package com.skillswap.moderationservice.repository;

import com.skillswap.moderationservice.domain.ContentReport;
import com.skillswap.moderationservice.domain.ContentReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ContentReportRepository extends JpaRepository<ContentReport, UUID> {
    boolean existsBySourceId(UUID sourceId);
    List<ContentReport> findByStatusOrderByCreatedAtDesc(ContentReportStatus status);
    List<ContentReport> findAllByOrderByCreatedAtDesc();
}
