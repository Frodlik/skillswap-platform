package com.skillswap.matchingservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    public static final String EXCHANGE = "skillswap.topic";

    public static final String SKILL_OFFERED_QUEUE     = "matching-service.skill-offered";
    public static final String SKILL_WANTED_QUEUE      = "matching-service.skill-wanted";
    public static final String PROFILE_UPDATED_QUEUE   = "matching-service.profile-updated";
    public static final String USER_REGISTERED_QUEUE   = "matching-service.user-registered";
    public static final String SESSION_COMPLETED_QUEUE = "matching-service.session-completed";

    public static final String SKILL_OFFERED_KEY     = "skill.offered";
    public static final String SKILL_WANTED_KEY      = "skill.wanted";
    public static final String PROFILE_UPDATED_KEY   = "user.profile.updated";
    public static final String USER_REGISTERED_KEY   = "user.registered";
    public static final String SESSION_COMPLETED_KEY = "session.completed";

    public static final String MATCH_FOUND_KEY    = "match.found";
    public static final String MATCH_ACCEPTED_KEY = "match.accepted";

    @Bean
    TopicExchange skillswapTopicExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean Queue skillOfferedQueue()     { return QueueBuilder.durable(SKILL_OFFERED_QUEUE).build(); }
    @Bean Queue skillWantedQueue()      { return QueueBuilder.durable(SKILL_WANTED_QUEUE).build(); }
    @Bean Queue profileUpdatedQueue()   { return QueueBuilder.durable(PROFILE_UPDATED_QUEUE).build(); }
    @Bean Queue userRegisteredQueue()   { return QueueBuilder.durable(USER_REGISTERED_QUEUE).build(); }
    @Bean Queue sessionCompletedQueue() { return QueueBuilder.durable(SESSION_COMPLETED_QUEUE).build(); }

    @Bean
    Binding skillOfferedBinding(Queue skillOfferedQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(skillOfferedQueue).to(skillswapTopicExchange).with(SKILL_OFFERED_KEY);
    }

    @Bean
    Binding skillWantedBinding(Queue skillWantedQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(skillWantedQueue).to(skillswapTopicExchange).with(SKILL_WANTED_KEY);
    }

    @Bean
    Binding profileUpdatedBinding(Queue profileUpdatedQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(profileUpdatedQueue).to(skillswapTopicExchange).with(PROFILE_UPDATED_KEY);
    }

    @Bean
    Binding userRegisteredBinding(Queue userRegisteredQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(userRegisteredQueue).to(skillswapTopicExchange).with(USER_REGISTERED_KEY);
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
