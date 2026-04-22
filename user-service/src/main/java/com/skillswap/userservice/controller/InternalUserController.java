package com.skillswap.userservice.controller;

import com.skillswap.userservice.dto.response.PreferenceResponse;
import com.skillswap.userservice.dto.response.UserBriefResponse;
import com.skillswap.userservice.service.ProfileService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/internal/users")
public class InternalUserController {

    private final ProfileService profileService;

    public InternalUserController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/{id}/preferences")
    PreferenceResponse getPreferences(@PathVariable UUID id) {
        return profileService.getPreferences(id);
    }

    @GetMapping("/{id}/brief")
    UserBriefResponse getBrief(@PathVariable UUID id) {
        return profileService.getBrief(id);
    }
}
