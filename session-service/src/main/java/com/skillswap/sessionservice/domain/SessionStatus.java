package com.skillswap.sessionservice.domain;

// Session lifecycle:
//
//   PROPOSED ──accept──→ SCHEDULED ──auto/manual──→ ACTIVE ──auto/manual──→ COMPLETED
//      │                     │                         │
//      │                     └──cancel──┐              └──cancel──┐
//      ├──decline────→ REJECTED         │                         │
//      └──cancel─────→ CANCELLED ←──────┴─────────────────────────┘
//
// PROPOSED  — proposer kicked off the booking; invitee has not yet responded.
//             Wallet HOLD is active so the tokens cannot be double-booked.
// SCHEDULED — both sides agreed; waiting for scheduledAt to roll around.
// ACTIVE    — currently happening (started by lifecycle scheduler).
// COMPLETED — finished cleanly; tokens transferred from learner to teacher.
// REJECTED  — invitee said no; HOLD released back to learner.
// CANCELLED — either party (or scheduler) cancelled; HOLD released.
//
// Terminal states: COMPLETED, REJECTED, CANCELLED.
public enum SessionStatus {
    PROPOSED,
    SCHEDULED,
    ACTIVE,
    COMPLETED,
    REJECTED,
    CANCELLED
}
