package com.skillswap.skillservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_skills")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "category")
public class UserSkill {

    @Id
    @Column(nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private SkillCategory category;

    @Column(nullable = false, length = 200)
    private String skillName;

    @Column(nullable = false)
    private int skillLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private SkillType type;

    @Column(columnDefinition = "text[]")
    private String[] tags;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
