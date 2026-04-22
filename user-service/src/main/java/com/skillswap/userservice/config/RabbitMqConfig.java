package com.skillswap.userservice.config;

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
    public static final String USER_REGISTERED_QUEUE = "user-service.user-registered";
    public static final String USER_REGISTERED_KEY = "user.registered";
    public static final String PROFILE_UPDATED_KEY = "user.profile.updated";

    @Bean
    TopicExchange skillswapTopicExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    Queue userRegisteredQueue() {
        return QueueBuilder.durable(USER_REGISTERED_QUEUE).build();
    }

    @Bean
    Binding userRegisteredBinding(Queue userRegisteredQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(userRegisteredQueue)
                .to(skillswapTopicExchange)
                .with(USER_REGISTERED_KEY);
    }

    @Bean
    JacksonJsonMessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
