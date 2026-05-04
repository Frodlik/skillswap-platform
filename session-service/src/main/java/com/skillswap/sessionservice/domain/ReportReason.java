package com.skillswap.sessionservice.domain;

// Reasons a user can report a session participant. Stored as varchar in DB
// (Liquibase column type matches enum name length — 32 chars is plenty).
public enum ReportReason {
    HARASSMENT,        // verbal abuse, threats, intimidation
    HATE_SPEECH,       // racism, sexism, homophobia, religious slurs, etc.
    INAPPROPRIATE,     // sexual content, nudity, violent content
    NO_SHOW,           // partner did not appear or left immediately
    OFF_TOPIC,         // taught/learned a different skill than agreed
    SCAM,              // fraud, soliciting payment outside the platform
    OTHER              // free-text comment carries the actual reason
}
