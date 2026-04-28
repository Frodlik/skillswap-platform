package com.skillswap.userservice.service;

import com.skillswap.userservice.domain.Profile;
import com.skillswap.userservice.domain.UserPreference;
import com.skillswap.userservice.dto.request.PreferenceUpdateRequest;
import com.skillswap.userservice.dto.request.UpdateProfileRequest;
import com.skillswap.userservice.dto.response.PreferenceResponse;
import com.skillswap.userservice.dto.response.ProfileResponse;
import com.skillswap.userservice.event.ProfileUpdated;
import com.skillswap.userservice.event.UserRegisteredEvent;
import com.skillswap.userservice.exception.ProfileNotFoundException;
import com.skillswap.userservice.repository.ProfileRepository;
import com.skillswap.userservice.repository.UserPreferenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock ProfileRepository profileRepository;
    @Mock UserPreferenceRepository userPreferenceRepository;
    @Mock ApplicationEventPublisher applicationEventPublisher;

    private ProfileService profileService;

    @BeforeEach
    void setUp() {
        profileService = new ProfileService(profileRepository, userPreferenceRepository, applicationEventPublisher);
    }

    @Nested
    class GetProfile {

        @Test
        void found_returnsProfileResponse() {
            UUID userId = UUID.randomUUID();
            when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(buildProfile(userId)));

            ProfileResponse response = profileService.getProfile(userId);

            assertThat(response.userId()).isEqualTo(userId);
            assertThat(response.displayName()).isEqualTo("testuser");
        }

        @Test
        void notFound_throwsProfileNotFoundException() {
            UUID userId = UUID.randomUUID();
            when(profileRepository.findByUserId(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> profileService.getProfile(userId))
                    .isInstanceOf(ProfileNotFoundException.class);
        }
    }

    @Nested
    class UpdateProfile {

        @Test
        void changedFields_savedAndEventPublished() {
            UUID userId = UUID.randomUUID();
            Profile profile = buildProfile(userId);
            when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
            when(profileRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            UpdateProfileRequest request = new UpdateProfileRequest(
                    "newname", null, null, null, null, null);
            ProfileResponse response = profileService.updateProfile(userId, request);

            assertThat(response.displayName()).isEqualTo("newname");

            ArgumentCaptor<ProfileUpdated> eventCap = ArgumentCaptor.forClass(ProfileUpdated.class);
            verify(applicationEventPublisher).publishEvent(eventCap.capture());
            assertThat(eventCap.getValue().changedFields()).containsExactly("displayName");
        }

        @Test
        void noFieldsChanged_noEventPublished() {
            UUID userId = UUID.randomUUID();
            Profile profile = buildProfile(userId);
            when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

            UpdateProfileRequest request = new UpdateProfileRequest(
                    "testuser", null, null, null, null, null);
            profileService.updateProfile(userId, request);

            verify(applicationEventPublisher, never()).publishEvent(any());
        }
    }

    @Nested
    class UpdatePreferences {

        @Test
        void updatesAndReturns() {
            UUID userId = UUID.randomUUID();
            UserPreference prefs = buildPrefs(userId);
            when(userPreferenceRepository.findByUserId(userId)).thenReturn(Optional.of(prefs));
            when(userPreferenceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            PreferenceUpdateRequest request = new PreferenceUpdateRequest(
                    new String[]{"en", "uk"}, "UTC+2", "{\"monday\":[\"09:00\",\"17:00\"]}");
            PreferenceResponse response = profileService.updatePreferences(userId, request);

            assertThat(response.preferredTimezoneRange()).isEqualTo("UTC+2");
            assertThat(response.preferredLanguages()).containsExactly("en", "uk");
        }

        @Test
        void notFound_throwsProfileNotFoundException() {
            UUID userId = UUID.randomUUID();
            when(userPreferenceRepository.findByUserId(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> profileService.updatePreferences(userId,
                    new PreferenceUpdateRequest(null, null, null)))
                    .isInstanceOf(ProfileNotFoundException.class);
        }
    }

    @Nested
    class CreateProfileFromEvent {

        @Test
        void createsProfileWithEmailPrefix() {
            UUID userId = UUID.randomUUID();
            UserRegisteredEvent event = new UserRegisteredEvent(userId, "john.doe@example.com", Instant.now());
            when(profileRepository.existsByUserId(userId)).thenReturn(false);
            when(profileRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(userPreferenceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            profileService.createProfileFromEvent(event);

            ArgumentCaptor<Profile> profileCap = ArgumentCaptor.forClass(Profile.class);
            verify(profileRepository).save(profileCap.capture());
            assertThat(profileCap.getValue().getDisplayName()).isEqualTo("john.doe");
            assertThat(profileCap.getValue().getUserId()).isEqualTo(userId);
        }

        @Test
        void idempotent_skipsIfProfileExists() {
            UUID userId = UUID.randomUUID();
            UserRegisteredEvent event = new UserRegisteredEvent(userId, "exists@example.com", Instant.now());
            when(profileRepository.existsByUserId(userId)).thenReturn(true);

            profileService.createProfileFromEvent(event);

            verify(profileRepository, never()).save(any());
            verify(userPreferenceRepository, never()).save(any());
        }

        @Test
        void createsDefaultPreferences() {
            UUID userId = UUID.randomUUID();
            UserRegisteredEvent event = new UserRegisteredEvent(userId, "user@example.com", Instant.now());
            when(profileRepository.existsByUserId(userId)).thenReturn(false);
            when(profileRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(userPreferenceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            profileService.createProfileFromEvent(event);

            ArgumentCaptor<UserPreference> prefCap = ArgumentCaptor.forClass(UserPreference.class);
            verify(userPreferenceRepository).save(prefCap.capture());
            assertThat(prefCap.getValue().getUserId()).isEqualTo(userId);
        }
    }

    @Nested
    class SearchProfiles {

        @Test
        void withBothFilters_returnsMatchingProfiles() {
            UUID userId = UUID.randomUUID();
            Profile profile = buildProfile(userId);
            when(profileRepository.search("en", "UTC")).thenReturn(List.of(profile));

            List<ProfileResponse> results = profileService.searchProfiles("en", "UTC");

            assertThat(results).hasSize(1);
            assertThat(results.getFirst().userId()).isEqualTo(userId);
        }
    }

    @Nested
    class GetPreferences {

        @Test
        void found_returnsPreferenceResponse() {
            UUID userId = UUID.randomUUID();
            UserPreference prefs = buildPrefs(userId);
            when(userPreferenceRepository.findByUserId(userId)).thenReturn(Optional.of(prefs));

            PreferenceResponse response = profileService.getPreferences(userId);

            assertThat(response.userId()).isEqualTo(userId);
        }
    }

    @Nested
    class GetBrief {

        @Test
        void found_returnsUserBriefResponse() {
            UUID userId = UUID.randomUUID();
            Profile profile = Profile.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .displayName("testuser")
                    .language("EN")
                    .timezone("UTC")
                    .rating(new BigDecimal("4.2"))
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
            when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

            var response = profileService.getBrief(userId);

            assertThat(response.userId()).isEqualTo(userId);
            assertThat(response.displayName()).isEqualTo("testuser");
            assertThat(response.language()).isEqualTo("EN");
            assertThat(response.timezone()).isEqualTo("UTC");
        }
    }

    @Nested
    class UpdateRating {

        @Test
        void notFound_throwsProfileNotFoundException() {
            UUID userId = UUID.randomUUID();
            when(profileRepository.findByUserId(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> profileService.updateRating(userId, new BigDecimal("4.5")))
                    .isInstanceOf(ProfileNotFoundException.class);
        }

        @Test
        void updatesRatingAndSaves() {
            UUID userId = UUID.randomUUID();
            Profile profile = buildProfile(userId);
            when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
            when(profileRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            BigDecimal newRating = new BigDecimal("4.7");
            profileService.updateRating(userId, newRating);

            ArgumentCaptor<Profile> profileCap = ArgumentCaptor.forClass(Profile.class);
            verify(profileRepository).save(profileCap.capture());
            assertThat(profileCap.getValue().getRating()).isEqualTo(newRating);

            ArgumentCaptor<ProfileUpdated> eventCap = ArgumentCaptor.forClass(ProfileUpdated.class);
            verify(applicationEventPublisher).publishEvent(eventCap.capture());
            assertThat(eventCap.getValue().changedFields()).containsExactly("rating");
        }

        @Test
        void publishesProfileUpdatedEvent_withRatingInChangedFields() {
            UUID userId = UUID.randomUUID();
            Profile profile = buildProfile(userId);
            when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
            when(profileRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            profileService.updateRating(userId, new BigDecimal("3.9"));

            ArgumentCaptor<ProfileUpdated> eventCap = ArgumentCaptor.forClass(ProfileUpdated.class);
            verify(applicationEventPublisher).publishEvent(eventCap.capture());
            assertThat(eventCap.getValue().userId()).isEqualTo(userId);
            assertThat(eventCap.getValue().changedFields()).isEqualTo(List.of("rating"));
        }
    }

    private Profile buildProfile(UUID userId) {
        return Profile.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .displayName("testuser")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    private UserPreference buildPrefs(UUID userId) {
        return UserPreference.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .build();
    }
}
