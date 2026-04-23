package com.skillswap.skillservice.exception;

import java.util.UUID;

public class SkillNotFoundException extends RuntimeException {

    public SkillNotFoundException(UUID skillId) {
        super("Skill not found: " + skillId);
    }
}
