package com.skillswap.skillservice.service;

import com.skillswap.skillservice.domain.SkillCategory;
import com.skillswap.skillservice.domain.SkillType;
import com.skillswap.skillservice.domain.UserSkill;
import com.skillswap.skillservice.dto.request.SkillCreateRequest;
import com.skillswap.skillservice.dto.response.CategoryResponse;
import com.skillswap.skillservice.dto.response.SkillResponse;
import com.skillswap.skillservice.event.SkillCreatedEvent;
import com.skillswap.skillservice.exception.CategoryNotFoundException;
import com.skillswap.skillservice.exception.SkillNotFoundException;
import com.skillswap.skillservice.repository.SkillCategoryRepository;
import com.skillswap.skillservice.repository.UserSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Instant;
import java.util.ArrayList;
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
class SkillServiceTest {

    @Mock UserSkillRepository userSkillRepository;
    @Mock SkillCategoryRepository skillCategoryRepository;
    @Mock ApplicationEventPublisher eventPublisher;

    private SkillService skillService;

    @BeforeEach
    void setUp() {
        skillService = new SkillService(userSkillRepository, skillCategoryRepository, eventPublisher);
    }

    @Nested
    class GetCategories {

        @Test
        void returnsRootsWithChildren() {
            SkillCategory child = buildCategory(UUID.randomUUID(), "Backend", List.of());
            SkillCategory root = buildCategory(UUID.randomUUID(), "Programming", List.of(child));
            when(skillCategoryRepository.findRoots()).thenReturn(List.of(root));

            List<CategoryResponse> result = skillService.getCategories();

            assertThat(result).hasSize(1);
            assertThat(result.getFirst().name()).isEqualTo("Programming");
            assertThat(result.getFirst().children()).hasSize(1);
            assertThat(result.getFirst().children().getFirst().name()).isEqualTo("Backend");
        }

        @Test
        void emptyRepo_returnsEmptyList() {
            when(skillCategoryRepository.findRoots()).thenReturn(List.of());
            assertThat(skillService.getCategories()).isEmpty();
        }
    }

    @Nested
    class AddSkill {

        @Test
        void offer_savesAndPublishesOfferedEvent() {
            UUID userId = UUID.randomUUID();
            SkillCategory cat = buildCategory(UUID.randomUUID(), "Backend", List.of());
            when(skillCategoryRepository.findById(cat.getId())).thenReturn(Optional.of(cat));
            when(userSkillRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            SkillCreateRequest req = new SkillCreateRequest(
                    "Spring Boot", cat.getId(), 4, SkillType.OFFER, List.of("java", "spring"), null);

            SkillResponse resp = skillService.addSkill(userId, req, SkillType.OFFER);

            assertThat(resp.name()).isEqualTo("Spring Boot");
            assertThat(resp.type()).isEqualTo(SkillType.OFFER);
            assertThat(resp.tags()).containsExactly("java", "spring");

            ArgumentCaptor<SkillCreatedEvent> captor = ArgumentCaptor.forClass(SkillCreatedEvent.class);
            verify(eventPublisher).publishEvent(captor.capture());
            assertThat(captor.getValue()).isInstanceOf(SkillCreatedEvent.Offered.class);
        }

        @Test
        void want_publishesWantedEvent() {
            UUID userId = UUID.randomUUID();
            SkillCategory cat = buildCategory(UUID.randomUUID(), "Frontend", List.of());
            when(skillCategoryRepository.findById(cat.getId())).thenReturn(Optional.of(cat));
            when(userSkillRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            SkillCreateRequest req = new SkillCreateRequest(
                    "React", cat.getId(), 2, SkillType.WANT, List.of("react"), null);

            skillService.addSkill(userId, req, SkillType.WANT);

            ArgumentCaptor<SkillCreatedEvent> captor = ArgumentCaptor.forClass(SkillCreatedEvent.class);
            verify(eventPublisher).publishEvent(captor.capture());
            assertThat(captor.getValue()).isInstanceOf(SkillCreatedEvent.Wanted.class);
        }

        @Test
        void unknownCategory_throwsCategoryNotFoundException() {
            UUID userId = UUID.randomUUID();
            UUID catId = UUID.randomUUID();
            when(skillCategoryRepository.findById(catId)).thenReturn(Optional.empty());

            SkillCreateRequest req = new SkillCreateRequest(
                    "Go", catId, 3, SkillType.OFFER, null, null);

            assertThatThrownBy(() -> skillService.addSkill(userId, req, SkillType.OFFER))
                    .isInstanceOf(CategoryNotFoundException.class);
            verify(userSkillRepository, never()).save(any());
        }

        @Test
        void nullTags_treatedAsEmpty() {
            UUID userId = UUID.randomUUID();
            SkillCategory cat = buildCategory(UUID.randomUUID(), "Music", List.of());
            when(skillCategoryRepository.findById(cat.getId())).thenReturn(Optional.of(cat));
            when(userSkillRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            SkillCreateRequest req = new SkillCreateRequest(
                    "Guitar", cat.getId(), 3, SkillType.OFFER, null, null);

            SkillResponse resp = skillService.addSkill(userId, req, SkillType.OFFER);
            assertThat(resp.tags()).isEmpty();
        }
    }

    @Nested
    class GetUserSkills {

        @Test
        void returnsAllSkillsForUser() {
            UUID userId = UUID.randomUUID();
            SkillCategory cat = buildCategory(UUID.randomUUID(), "Design", List.of());
            UserSkill skill = buildSkill(userId, cat, SkillType.OFFER);
            when(userSkillRepository.findByUserId(userId)).thenReturn(List.of(skill));

            List<SkillResponse> result = skillService.getUserSkills(userId);

            assertThat(result).hasSize(1);
            assertThat(result.getFirst().userId()).isEqualTo(userId);
        }

        @Test
        void noSkills_returnsEmptyList() {
            UUID userId = UUID.randomUUID();
            when(userSkillRepository.findByUserId(userId)).thenReturn(List.of());
            assertThat(skillService.getUserSkills(userId)).isEmpty();
        }
    }

    @Nested
    class DeleteSkill {

        @Test
        void existingSkill_deleted() {
            UUID userId = UUID.randomUUID();
            SkillCategory cat = buildCategory(UUID.randomUUID(), "Design", List.of());
            UserSkill skill = buildSkill(userId, cat, SkillType.OFFER);
            when(userSkillRepository.findById(skill.getId())).thenReturn(Optional.of(skill));

            skillService.deleteSkill(skill.getId());

            verify(userSkillRepository).delete(skill);
        }

        @Test
        void unknownSkill_throwsSkillNotFoundException() {
            UUID skillId = UUID.randomUUID();
            when(userSkillRepository.findById(skillId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> skillService.deleteSkill(skillId))
                    .isInstanceOf(SkillNotFoundException.class);
            verify(userSkillRepository, never()).delete(any());
        }
    }

    @Nested
    class Search {

        @Test
        void byTagOnly_returnsMatches() {
            UUID userId = UUID.randomUUID();
            SkillCategory cat = buildCategory(UUID.randomUUID(), "Programming", List.of());
            UserSkill skill = buildSkill(userId, cat, SkillType.OFFER);
            when(userSkillRepository.search(null, "java")).thenReturn(List.of(skill));

            List<SkillResponse> result = skillService.search("java", null);

            assertThat(result).hasSize(1);
        }

        @Test
        void byCategoryOnly_returnsMatches() {
            UUID userId = UUID.randomUUID();
            SkillCategory cat = buildCategory(UUID.randomUUID(), "Backend", List.of());
            UserSkill skill = buildSkill(userId, cat, SkillType.WANT);
            when(userSkillRepository.search(cat.getId(), null)).thenReturn(List.of(skill));

            List<SkillResponse> result = skillService.search(null, cat.getId());

            assertThat(result).hasSize(1);
        }
    }

    private SkillCategory buildCategory(UUID id, String name, List<SkillCategory> children) {
        return SkillCategory.builder()
                .id(id)
                .name(name)
                .icon("test")
                .children(children == null ? new ArrayList<>() : new ArrayList<>(children))
                .build();
    }

    private UserSkill buildSkill(UUID userId, SkillCategory category, SkillType type) {
        return UserSkill.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .category(category)
                .skillName("Test Skill")
                .skillLevel(3)
                .type(type)
                .tags(new String[]{"java"})
                .createdAt(Instant.now())
                .build();
    }
}
