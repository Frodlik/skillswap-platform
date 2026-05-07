package com.skillswap.authservice.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_bans")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UserBan {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false, length = 20)
    private String type; // TEMP_BAN or PERMANENT_BAN

    @Column(name = "expires_at")
    private Instant expiresAt; // null for PERMANENT_BAN

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
