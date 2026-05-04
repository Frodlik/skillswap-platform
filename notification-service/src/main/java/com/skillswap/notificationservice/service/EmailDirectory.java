package com.skillswap.notificationservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

// In-memory cache: userId → email. Populated when we consume user.registered
// events; queried by every other listener that needs to send mail.
//
// Trade-off vs. calling user-service over HTTP:
//   - Pros: zero network hops, no circuit breaker needed, no shared schema.
//   - Cons: empty after a notification-service restart until users register
//           again. New events keep arriving though — message queues are
//           durable, so user.registered events that landed during the
//           outage are replayed on startup.
//
// For production we'd want either (a) a persisted KV store (Redis),
// or (b) extend UserBrief to include email and add a getOrFetch fallback.
// MVP stays in memory; documented in docs/frontend-guide.md §11.
@Component
public class EmailDirectory {

    private static final Logger log = LoggerFactory.getLogger(EmailDirectory.class);

    private final ConcurrentHashMap<UUID, String> emailByUserId = new ConcurrentHashMap<>();

    public void put(UUID userId, String email) {
        emailByUserId.put(userId, email);
        log.debug("EmailDirectory cached email for userId={} (size={})", userId, emailByUserId.size());
    }

    public Optional<String> find(UUID userId) {
        return Optional.ofNullable(emailByUserId.get(userId));
    }

    public int size() {
        return emailByUserId.size();
    }
}
