package com.skillswap.skillservice.event;

public sealed interface SkillCreatedEvent permits SkillCreatedEvent.Offered, SkillCreatedEvent.Wanted {

    record Offered(SkillOffered payload) implements SkillCreatedEvent {}
    record Wanted(SkillWanted payload) implements SkillCreatedEvent {}
}
