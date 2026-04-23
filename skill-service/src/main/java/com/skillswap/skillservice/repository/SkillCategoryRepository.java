package com.skillswap.skillservice.repository;

import com.skillswap.skillservice.domain.SkillCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface SkillCategoryRepository extends JpaRepository<SkillCategory, UUID> {

    @Query("SELECT c FROM SkillCategory c LEFT JOIN FETCH c.children WHERE c.parent IS NULL")
    List<SkillCategory> findRoots();
}
