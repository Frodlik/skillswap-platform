package com.skillswap.userservice.repository;

import com.skillswap.userservice.domain.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    Optional<Profile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    @Query("SELECT p FROM Profile p WHERE (:language IS NULL OR p.language = :language) " +
           "AND (:timezone IS NULL OR p.timezone = :timezone)")
    List<Profile> search(@Param("language") String language, @Param("timezone") String timezone);
}
