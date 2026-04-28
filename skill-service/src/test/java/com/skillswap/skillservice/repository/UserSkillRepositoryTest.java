package com.skillswap.skillservice.repository;

import com.skillswap.skillservice.domain.SkillCategory;
import com.skillswap.skillservice.domain.SkillType;
import com.skillswap.skillservice.domain.UserSkill;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers
@ActiveProfiles("test")
@Transactional
class UserSkillRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @MockitoBean
    RabbitTemplate rabbitTemplate;

    @Autowired UserSkillRepository userSkillRepository;
    @Autowired SkillCategoryRepository skillCategoryRepository;

    private SkillCategory savedCategory;

    @BeforeEach
    void setUp() {
        userSkillRepository.deleteAll();
        skillCategoryRepository.deleteAll();

        savedCategory = skillCategoryRepository.save(
                SkillCategory.builder()
                        .id(UUID.randomUUID())
                        .name("Programming")
                        .icon("code")
                        .build());
    }

    @Test
    void findByUserId_returnsOnlySkillsForThatUser() {
        UUID user1 = UUID.randomUUID();
        UUID user2 = UUID.randomUUID();
        save(user1, SkillType.OFFER, new String[]{"java"});
        save(user2, SkillType.WANT, new String[]{"python"});

        List<UserSkill> result = userSkillRepository.findByUserId(user1);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getUserId()).isEqualTo(user1);
    }

    @Test
    void search_byTag_returnsMatchingSkills() {
        UUID userId = UUID.randomUUID();
        save(userId, SkillType.OFFER, new String[]{"java", "spring"});
        save(userId, SkillType.OFFER, new String[]{"python"});

        List<UserSkill> result = userSkillRepository.search(null, "java");

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getTags()).contains("java");
    }

    @Test
    void search_byCategory_returnsMatchingSkills() {
        UUID userId = UUID.randomUUID();
        save(userId, SkillType.OFFER, new String[]{"go"});

        List<UserSkill> result = userSkillRepository.search(savedCategory.getId(), null);

        assertThat(result).hasSize(1);
    }

    @Test
    void search_byTagAndCategory_returnsIntersection() {
        UUID userId = UUID.randomUUID();
        save(userId, SkillType.OFFER, new String[]{"java", "spring"});
        save(userId, SkillType.OFFER, new String[]{"java"});

        List<UserSkill> result = userSkillRepository.search(savedCategory.getId(), "spring");

        assertThat(result).hasSize(1);
    }

    @Test
    void search_noFilters_returnsAll() {
        UUID userId = UUID.randomUUID();
        save(userId, SkillType.OFFER, new String[]{"java"});
        save(userId, SkillType.WANT, new String[]{"python"});

        List<UserSkill> result = userSkillRepository.search(null, null);

        assertThat(result).hasSize(2);
    }

    @Test
    void search_tagNotPresent_returnsEmpty() {
        UUID userId = UUID.randomUUID();
        save(userId, SkillType.OFFER, new String[]{"java"});

        List<UserSkill> result = userSkillRepository.search(null, "rust");

        assertThat(result).isEmpty();
    }

    private void save(UUID userId, SkillType type, String[] tags) {
        userSkillRepository.save(
                UserSkill.builder()
                        .id(UUID.randomUUID())
                        .userId(userId)
                        .category(savedCategory)
                        .skillName("Test Skill")
                        .skillLevel(3)
                        .type(type)
                        .tags(tags)
                        .build());
    }
}
