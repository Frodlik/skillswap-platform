package com.skillswap.userservice.controller;

import com.skillswap.userservice.dto.request.PreferenceUpdateRequest;
import com.skillswap.userservice.dto.request.UpdateProfileRequest;
import com.skillswap.userservice.dto.response.PreferenceResponse;
import com.skillswap.userservice.dto.response.ProfileResponse;
import com.skillswap.userservice.service.ProfileService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@AllArgsConstructor
public class UserController {

    private final ProfileService profileService;

    @GetMapping("/{id}")
    ProfileResponse getProfile(@PathVariable UUID id) {
        return profileService.getProfile(id);
    }

    @PutMapping("/{id}")
    ProfileResponse updateProfile(@PathVariable UUID id,
                                  @Valid @RequestBody UpdateProfileRequest request) {
        return profileService.updateProfile(id, request);
    }

    @GetMapping("/search")
    List<ProfileResponse> search(@RequestParam(required = false) String language,
                                 @RequestParam(required = false) String timezone) {
        return profileService.searchProfiles(language, timezone);
    }

    @PatchMapping("/{id}/preferences")
    PreferenceResponse updatePreferences(@PathVariable UUID id,
                                         @Valid @RequestBody PreferenceUpdateRequest request) {
        return profileService.updatePreferences(id, request);
    }
}
