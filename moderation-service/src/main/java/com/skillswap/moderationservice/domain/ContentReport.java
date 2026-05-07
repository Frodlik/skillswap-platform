package com.skillswap.moderationservice.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "content_reports")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ContentReport {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "source_id", nullable = false, unique = true)
    private UUID sourceId;

    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId;

    @Column(name = "reported_user_id", nullable = false)
    private UUID reportedUserId;

    @Column(nullable = false, length = 30)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private ContentReportStatus status;

    @Column(name = "resolved_by")
    private UUID resolvedBy;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
