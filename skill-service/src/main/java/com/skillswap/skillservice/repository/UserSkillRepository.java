package com.skillswap.skillservice.repository;

import com.skillswap.skillservice.domain.SkillType;
import com.skillswap.skillservice.domain.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface UserSkillRepository extends JpaRepository<UserSkill, UUID> {

    List<UserSkill> findByUserId(UUID userId);

    List<UserSkill> findByUserIdAndType(UUID userId, SkillType type);

    @Query(value = """
            SELECT * FROM user_skills us
            WHERE (:categoryId IS NULL OR us.category_id = :categoryId)
              AND (:tag IS NULL OR us.tags @> ARRAY[:tag]::text[])
            """, nativeQuery = true)
    List<UserSkill> search(@Param("categoryId") UUID categoryId,
                           @Param("tag") String tag);
}
