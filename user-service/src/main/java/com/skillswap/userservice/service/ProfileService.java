package com.skillswap.userservice.service;

import com.skillswap.userservice.domain.Profile;
import com.skillswap.userservice.domain.UserPreference;
import com.skillswap.userservice.dto.request.PreferenceUpdateRequest;
import com.skillswap.userservice.dto.request.UpdateProfileRequest;
import com.skillswap.userservice.dto.response.PreferenceResponse;
import com.skillswap.userservice.dto.response.ProfileResponse;
import com.skillswap.userservice.dto.response.UserBriefResponse;
import com.skillswap.userservice.event.ProfileUpdated;
import com.skillswap.userservice.event.UserRegisteredEvent;
import com.skillswap.userservice.exception.ProfileNotFoundException;
import com.skillswap.userservice.repository.ProfileRepository;
import com.skillswap.userservice.repository.UserPreferenceRepository;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;

@Service
@AllArgsConstructor
public class ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);

    private final ProfileRepository profileRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(UUID userId) {
        return profileRepository.findByUserId(userId)
                .map(this::toProfileResponse)
                .orElseThrow(() -> new ProfileNotFoundException(userId));
    }

    @Transactional
    public ProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException(userId));

        List<String> changedFields = new ArrayList<>();

        applyIfChanged(request.displayName(), profile.getDisplayName(), profile::setDisplayName, "displayName", changedFields);
        applyIfChanged(request.bio(), profile.getBio(), profile::setBio, "bio", changedFields);
        applyIfChanged(request.avatarUrl(), profile.getAvatarUrl(), profile::setAvatarUrl, "avatarUrl", changedFields);
        applyIfChanged(request.timezone(), profile.getTimezone(), profile::setTimezone, "timezone", changedFields);
        applyIfChanged(request.language(), profile.getLanguage(), profile::setLanguage, "language", changedFields);
        applyIfChanged(request.location(), profile.getLocation(), profile::setLocation, "location", changedFields);

        if (!changedFields.isEmpty()) {
            profileRepository.save(profile);
            applicationEventPublisher.publishEvent(new ProfileUpdated(userId, changedFields));
        }

        return toProfileResponse(profile);
    }

    @Transactional(readOnly = true)
    public List<ProfileResponse> searchProfiles(String language, String timezone) {
        return profileRepository.search(language, timezone)
                .stream()
                .map(this::toProfileResponse)
                .toList();
    }

    @Transactional
    public PreferenceResponse updatePreferences(UUID userId, PreferenceUpdateRequest request) {
        UserPreference prefs = userPreferenceRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Preferences not found for userId=" + userId));

        Optional.ofNullable(request.preferredLanguages()).ifPresent(prefs::setPreferredLanguages);
        Optional.ofNullable(request.preferredTimezoneRange()).ifPresent(prefs::setPreferredTimezoneRange);
        Optional.ofNullable(request.availabilitySchedule()).ifPresent(prefs::setAvailabilitySchedule);

        userPreferenceRepository.save(prefs);
        return toPreferenceResponse(prefs);
    }

    @Transactional(readOnly = true)
    public PreferenceResponse getPreferences(UUID userId) {
        return userPreferenceRepository.findByUserId(userId)
                .map(this::toPreferenceResponse)
                .orElseThrow(() -> new ProfileNotFoundException("Preferences not found for userId=" + userId));
    }

    @Transactional(readOnly = true)
    public UserBriefResponse getBrief(UUID userId) {
        return profileRepository.findByUserId(userId)
                .map(p -> new UserBriefResponse(p.getUserId(), p.getDisplayName(),
                        p.getAvatarUrl(), p.getRating()))
                .orElseThrow(() -> new ProfileNotFoundException(userId));
    }

    @Transactional
    public void createProfileFromEvent(UserRegisteredEvent event) {
        if (profileRepository.existsByUserId(event.userId())) {
            return;
        }

        String displayName = event.email().split("@")[0];

        Profile profile = Profile.builder()
                .id(UUID.randomUUID())
                .userId(event.userId())
                .displayName(displayName)
                .build();
        profileRepository.save(profile);

        UserPreference prefs = UserPreference.builder()
                .id(UUID.randomUUID())
                .userId(event.userId())
                .build();
        userPreferenceRepository.save(prefs);

        log.info("Created profile for userId={}", event.userId());
    }

    private ProfileResponse toProfileResponse(Profile p) {
        return new ProfileResponse(
                p.getUserId(), p.getDisplayName(), p.getBio(),
                p.getAvatarUrl(), p.getTimezone(), p.getLanguage(),
                p.getLocation(), p.getRating(), p.getCreatedAt(), p.getUpdatedAt());
    }

    private PreferenceResponse toPreferenceResponse(UserPreference p) {
        return new PreferenceResponse(
                p.getUserId(), p.getPreferredLanguages(),
                p.getPreferredTimezoneRange(), p.getAvailabilitySchedule());
    }

    private <T> void applyIfChanged(T newVal, T oldVal, Consumer<T> setter, String field, List<String> changed) {
        if (newVal != null && !Objects.equals(newVal, oldVal)) {
            setter.accept(newVal);
            changed.add(field);
        }
    }
}
