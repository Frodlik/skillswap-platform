package com.skillswap.skillservice.controller;

import com.skillswap.skillservice.dto.response.SkillResponse;
import com.skillswap.skillservice.service.SkillService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/internal/skills")
@AllArgsConstructor
class InternalSkillController {

    private final SkillService skillService;

    @GetMapping("/user/{id}")
    List<SkillResponse> getUserSkills(@PathVariable UUID id) {
        return skillService.getUserSkills(id);
    }

    @DeleteMapping("/{skillId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteSkill(@PathVariable UUID skillId) {
        skillService.deleteSkill(skillId);
    }
}
