package com.skillswap.sessionservice.repository;

import com.skillswap.sessionservice.domain.Session;
import com.skillswap.sessionservice.domain.SessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {

    @Query("SELECT s FROM Session s WHERE s.teacherId = :userId OR s.learnerId = :userId")
    Page<Session> findByUser(@Param("userId") UUID userId, Pageable pageable);

    List<Session> findByStatusAndScheduledAtLessThanEqual(SessionStatus status, Instant cutoff);

    List<Session> findByStatus(SessionStatus status);
}
