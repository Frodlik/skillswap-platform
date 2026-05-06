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

    // Returns SCHEDULED/ACTIVE sessions of `userId` whose [start, start+duration]
    // window overlaps the requested [rangeStart, rangeEnd] window. Used by
    // SessionService.createSession to reject double-bookings before the
    // wallet HOLD operation runs.
    //
    // Native SQL because JPQL has no portable way to add an integer number of
    // hours to a timestamp inside a WHERE clause; PostgreSQL's INTERVAL
    // arithmetic does the math at the query level.
    //
    // Standard half-open overlap test: (existing_start < new_end) AND
    // (existing_end > new_start). Adjacent sessions that meet at a single
    // instant are NOT considered overlapping.
    @Query(value = """
        SELECT * FROM sessions
        WHERE (teacher_id = :userId OR learner_id = :userId)
          AND status IN ('PROPOSED', 'SCHEDULED', 'ACTIVE')
          AND scheduled_at < :rangeEnd
          AND scheduled_at + duration_tokens * INTERVAL '1 hour' > :rangeStart
        """, nativeQuery = true)
    List<Session> findOverlapping(@Param("userId") UUID userId,
                                  @Param("rangeStart") Instant rangeStart,
                                  @Param("rangeEnd") Instant rangeEnd);
}
