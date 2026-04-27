package com.skillswap.skillservice.controller;

import com.skillswap.skillservice.domain.SkillType;
import com.skillswap.skillservice.dto.request.SkillCreateRequest;
import com.skillswap.skillservice.dto.response.CategoryResponse;
import com.skillswap.skillservice.dto.response.SkillResponse;
import com.skillswap.skillservice.service.SkillService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/skills")
@AllArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping("/categories")
    List<CategoryResponse> getCategories() {
        return skillService.getCategories();
    }

    @PostMapping("/user/{userId}/offer")
    @ResponseStatus(HttpStatus.CREATED)
    SkillResponse addOffer(@PathVariable UUID userId,
                           @Valid @RequestBody SkillCreateRequest request) {
        return skillService.addSkill(userId, request, SkillType.OFFER);
    }

    @PostMapping("/user/{userId}/want")
    @ResponseStatus(HttpStatus.CREATED)
    SkillResponse addWant(@PathVariable UUID userId,
                          @Valid @RequestBody SkillCreateRequest request) {
        return skillService.addSkill(userId, request, SkillType.WANT);
    }

    @GetMapping("/user/{userId}")
    List<SkillResponse> getUserSkills(@PathVariable UUID userId) {
        return skillService.getUserSkills(userId);
    }

    @DeleteMapping("/{skillId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteSkill(@PathVariable UUID skillId) {
        skillService.deleteSkill(skillId);
    }

    @GetMapping("/search")
    List<SkillResponse> search(@RequestParam(required = false) String tag,
                               @RequestParam(required = false) UUID category) {
        return skillService.search(tag, category);
    }
}
