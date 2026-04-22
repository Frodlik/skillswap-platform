package com.skillswap.userservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID userId;

    @Column(length = 100)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 500)
    private String avatarUrl;

    @Column(length = 100)
    private String timezone;

    @Column(length = 10)
    private String language;

    @Column(length = 200)
    private String location;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
