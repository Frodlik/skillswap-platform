package com.skillswap.sessionservice.event.inbound;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MatchAcceptedEvent(UUID matchId, UUID userAId, UUID userBId) {}
