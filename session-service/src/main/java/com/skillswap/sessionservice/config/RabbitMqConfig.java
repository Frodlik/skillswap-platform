package com.skillswap.sessionservice.config;

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

    public static final String MATCH_ACCEPTED_QUEUE  = "session-service.match-accepted";
    public static final String USER_REGISTERED_QUEUE = "session-service.user-registered";

    public static final String MATCH_ACCEPTED_KEY    = "match.accepted";
    public static final String USER_REGISTERED_KEY   = "user.registered";
    public static final String SESSION_COMPLETED_KEY = "session.completed";

    @Bean
    TopicExchange skillswapTopicExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean Queue matchAcceptedQueue()  {
        return QueueBuilder.durable(MATCH_ACCEPTED_QUEUE).build();
    }

    @Bean Queue userRegisteredQueue() {
        return QueueBuilder.durable(USER_REGISTERED_QUEUE).build();
    }

    @Bean
    Binding matchAcceptedBinding(Queue matchAcceptedQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(matchAcceptedQueue).to(skillswapTopicExchange).with(MATCH_ACCEPTED_KEY);
    }

    @Bean
    Binding userRegisteredBinding(Queue userRegisteredQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(userRegisteredQueue).to(skillswapTopicExchange).with(USER_REGISTERED_KEY);
    }

    @Bean
    JacksonJsonMessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
