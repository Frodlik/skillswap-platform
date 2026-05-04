package com.skillswap.sessionservice.dto.response;

// Jitsi Meet room descriptor for a session.
//   roomName — deterministic, derived from sessionId so two participants
//              hitting GET /sessions/{id}/room land in the same room.
//   url      — full URL to open in browser or iframe.
public record RoomResponse(String roomName, String url) {}
