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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);

    private final ProfileRepository profileRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    public ProfileService(ProfileRepository profileRepository,
                          UserPreferenceRepository userPreferenceRepository,
                          ApplicationEventPublisher applicationEventPublisher) {
        this.profileRepository = profileRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.applicationEventPublisher = applicationEventPublisher;
    }

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

        if (request.displayName() != null && !request.displayName().equals(profile.getDisplayName())) {
            profile.setDisplayName(request.displayName());
            changedFields.add("displayName");
        }
        if (request.bio() != null && !request.bio().equals(profile.getBio())) {
            profile.setBio(request.bio());
            changedFields.add("bio");
        }
        if (request.avatarUrl() != null && !request.avatarUrl().equals(profile.getAvatarUrl())) {
            profile.setAvatarUrl(request.avatarUrl());
            changedFields.add("avatarUrl");
        }
        if (request.timezone() != null && !request.timezone().equals(profile.getTimezone())) {
            profile.setTimezone(request.timezone());
            changedFields.add("timezone");
        }
        if (request.language() != null && !request.language().equals(profile.getLanguage())) {
            profile.setLanguage(request.language());
            changedFields.add("language");
        }
        if (request.location() != null && !request.location().equals(profile.getLocation())) {
            profile.setLocation(request.location());
            changedFields.add("location");
        }

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

        if (request.preferredLanguages() != null) {
            prefs.setPreferredLanguages(request.preferredLanguages());
        }
        if (request.preferredTimezoneRange() != null) {
            prefs.setPreferredTimezoneRange(request.preferredTimezoneRange());
        }
        if (request.availabilitySchedule() != null) {
            prefs.setAvailabilitySchedule(request.availabilitySchedule());
        }

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
                p.getId(), p.getUserId(), p.getDisplayName(), p.getBio(),
                p.getAvatarUrl(), p.getTimezone(), p.getLanguage(),
                p.getLocation(), p.getRating(), p.getCreatedAt(), p.getUpdatedAt());
    }

    private PreferenceResponse toPreferenceResponse(UserPreference p) {
        return new PreferenceResponse(
                p.getId(), p.getUserId(), p.getPreferredLanguages(),
                p.getPreferredTimezoneRange(), p.getAvailabilitySchedule());
    }
}
