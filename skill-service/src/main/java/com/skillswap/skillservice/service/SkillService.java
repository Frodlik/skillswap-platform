package com.skillswap.skillservice.service;

import com.skillswap.skillservice.domain.SkillCategory;
import com.skillswap.skillservice.domain.SkillType;
import com.skillswap.skillservice.domain.UserSkill;
import com.skillswap.skillservice.dto.request.SkillCreateRequest;
import com.skillswap.skillservice.dto.response.CategoryResponse;
import com.skillswap.skillservice.dto.response.SkillResponse;
import com.skillswap.skillservice.event.SkillCreatedEvent;
import com.skillswap.skillservice.event.SkillOffered;
import com.skillswap.skillservice.event.SkillWanted;
import com.skillswap.skillservice.exception.CategoryNotFoundException;
import com.skillswap.skillservice.exception.SkillNotFoundException;
import com.skillswap.skillservice.repository.SkillCategoryRepository;
import com.skillswap.skillservice.repository.UserSkillRepository;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class SkillService {

    private static final Logger log = LoggerFactory.getLogger(SkillService.class);

    private final UserSkillRepository userSkillRepository;
    private final SkillCategoryRepository skillCategoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        return skillCategoryRepository.findRoots().stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    @Transactional
    public SkillResponse addSkill(UUID userId, SkillCreateRequest request) {
        SkillCategory category = skillCategoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new CategoryNotFoundException(request.categoryId()));

        String[] tagsArray = request.tags() == null ? new String[0]
                : request.tags().toArray(new String[0]);

        UserSkill skill = UserSkill.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .category(category)
                .skillName(request.name())
                .skillLevel(request.level())
                .type(request.type())
                .tags(tagsArray)
                .description(request.description())
                .build();

        userSkillRepository.save(skill);

        List<String> tagsList = Arrays.asList(tagsArray);
        SkillCreatedEvent domainEvent = switch (request.type()) {
            case OFFER -> new SkillCreatedEvent.Offered(
                    new SkillOffered(userId, skill.getId(), skill.getSkillName(), tagsList));
            case WANT -> new SkillCreatedEvent.Wanted(
                    new SkillWanted(userId, skill.getId(), skill.getSkillName(), tagsList));
        };
        eventPublisher.publishEvent(domainEvent);

        log.info("Added skill '{}' type={} for userId={}", skill.getSkillName(), skill.getType(), userId);
        return toSkillResponse(skill);
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getUserSkills(UUID userId) {
        return userSkillRepository.findByUserId(userId).stream()
                .map(this::toSkillResponse)
                .toList();
    }

    @Transactional
    public void deleteSkill(UUID skillId) {
        UserSkill skill = userSkillRepository.findById(skillId)
                .orElseThrow(() -> new SkillNotFoundException(skillId));
        userSkillRepository.delete(skill);
        log.info("Deleted skillId={}", skillId);
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> search(String tag, UUID categoryId) {
        return userSkillRepository.search(categoryId, tag).stream()
                .map(this::toSkillResponse)
                .toList();
    }

    private CategoryResponse toCategoryResponse(SkillCategory cat) {
        List<CategoryResponse> children = cat.getChildren().stream()
                .map(this::toCategoryResponse)
                .toList();
        return new CategoryResponse(cat.getId(), cat.getName(), cat.getIcon(), children);
    }

    private SkillResponse toSkillResponse(UserSkill s) {
        List<String> tags = s.getTags() == null ? List.of() : Arrays.stream(s.getTags()).toList();
        return new SkillResponse(
                s.getId(), s.getUserId(),
                s.getCategory().getId(), s.getCategory().getName(),
                s.getSkillName(), s.getSkillLevel(), s.getType(),
                tags, s.getDescription(), s.getCreatedAt());
    }
}
