package com.skillswap.skillservice.exception;

import com.skillswap.skillservice.domain.SkillType;

// Thrown when a user tries to add a skill that already exists for them
// (same name, same OFFER/WANT type — case-insensitive). Mapped to HTTP
// 409 Conflict by GlobalExceptionHandler. The DB uniqueness constraint
// (uq_user_skills_user_type_name) is the ultimate guard; the service-level
// check exists only to produce a clear error message instead of a Postgres
// driver exception bubbling up.
public class DuplicateSkillException extends RuntimeException {

    public DuplicateSkillException(String name, SkillType type) {
        super("You already have a " + type.name().toLowerCase() + " skill named '" + name + "'.");
    }
}
