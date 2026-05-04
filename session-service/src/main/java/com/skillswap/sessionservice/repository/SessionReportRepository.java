package com.skillswap.sessionservice.repository;

import com.skillswap.sessionservice.domain.SessionReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SessionReportRepository extends JpaRepository<SessionReport, UUID> {

    boolean existsBySessionIdAndReporterId(UUID sessionId, UUID reporterId);

    long countByReportedUserId(UUID reportedUserId);

    List<SessionReport> findByReportedUserIdOrderByCreatedAtDesc(UUID reportedUserId);
}
