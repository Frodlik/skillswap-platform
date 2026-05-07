package com.skillswap.authservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    public static final String EXCHANGE = "skillswap.topic";
    public static final String USER_REGISTERED_KEY = "user.registered";
    public static final String USER_SANCTIONED_KEY = "user.sanctioned";
    public static final String USER_SANCTION_LIFTED_KEY = "user.sanction-lifted";

    public static final String USER_SANCTIONED_QUEUE = "auth-service.user-sanctioned";
    public static final String USER_SANCTION_LIFTED_QUEUE = "auth-service.user-sanction-lifted";

    @Bean TopicExchange skillswapTopicExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean Queue userSanctionedQueue() {
        return QueueBuilder.durable(USER_SANCTIONED_QUEUE).build();
    }

    @Bean Queue userSanctionLiftedQueue() {
        return QueueBuilder.durable(USER_SANCTION_LIFTED_QUEUE).build();
    }

    @Bean Binding userSanctionedBinding(Queue userSanctionedQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(userSanctionedQueue).to(skillswapTopicExchange).with(USER_SANCTIONED_KEY);
    }

    @Bean Binding userSanctionLiftedBinding(Queue userSanctionLiftedQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(userSanctionLiftedQueue).to(skillswapTopicExchange).with(USER_SANCTION_LIFTED_KEY);
    }

    @Bean JacksonJsonMessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
