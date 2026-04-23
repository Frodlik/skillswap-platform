package com.skillswap.skillservice.controller;

import com.skillswap.skillservice.dto.response.SkillResponse;
import com.skillswap.skillservice.service.SkillService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
