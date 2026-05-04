package com.skillswap.notificationservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Topology mirrors the other services: shared "skillswap.topic" exchange,
// per-service durable queues bound to the routing keys we care about.
//
// We listen to four events:
//   user.registered    → welcome email + cache email-by-userId
//   match.found        → notify both candidates
//   match.accepted     → confirm to both, prompt to schedule
//   session.completed  → ask both to leave a review
@Configuration
public class RabbitMqConfig {

    public static final String EXCHANGE = "skillswap.topic";

    public static final String USER_REGISTERED_QUEUE   = "notification-service.user-registered";
    public static final String MATCH_FOUND_QUEUE       = "notification-service.match-found";
    public static final String MATCH_ACCEPTED_QUEUE    = "notification-service.match-accepted";
    public static final String SESSION_COMPLETED_QUEUE = "notification-service.session-completed";

    public static final String USER_REGISTERED_KEY   = "user.registered";
    public static final String MATCH_FOUND_KEY       = "match.found";
    public static final String MATCH_ACCEPTED_KEY    = "match.accepted";
    public static final String SESSION_COMPLETED_KEY = "session.completed";

    @Bean
    TopicExchange skillswapTopicExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean Queue userRegisteredQueue()   { return QueueBuilder.durable(USER_REGISTERED_QUEUE).build(); }
    @Bean Queue matchFoundQueue()       { return QueueBuilder.durable(MATCH_FOUND_QUEUE).build(); }
    @Bean Queue matchAcceptedQueue()    { return QueueBuilder.durable(MATCH_ACCEPTED_QUEUE).build(); }
    @Bean Queue sessionCompletedQueue() { return QueueBuilder.durable(SESSION_COMPLETED_QUEUE).build(); }

    @Bean
    Binding userRegisteredBinding(Queue userRegisteredQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(userRegisteredQueue).to(skillswapTopicExchange).with(USER_REGISTERED_KEY);
    }

    @Bean
    Binding matchFoundBinding(Queue matchFoundQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(matchFoundQueue).to(skillswapTopicExchange).with(MATCH_FOUND_KEY);
    }

    @Bean
    Binding matchAcceptedBinding(Queue matchAcceptedQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(matchAcceptedQueue).to(skillswapTopicExchange).with(MATCH_ACCEPTED_KEY);
    }

    @Bean
    Binding sessionCompletedBinding(Queue sessionCompletedQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(sessionCompletedQueue).to(skillswapTopicExchange).with(SESSION_COMPLETED_KEY);
    }

    @Bean
    JacksonJsonMessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
