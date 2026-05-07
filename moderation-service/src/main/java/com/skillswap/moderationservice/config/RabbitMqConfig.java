package com.skillswap.moderationservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    public static final String EXCHANGE = "skillswap.topic";
    public static final String USER_SANCTIONED_KEY = "user.sanctioned";
    public static final String USER_SANCTION_LIFTED_KEY = "user.sanction-lifted";
    public static final String SESSION_REPORT_SUBMITTED_KEY = "session.report-submitted";
    public static final String SESSION_REPORT_QUEUE = "moderation-service.session-report-submitted";

    @Bean TopicExchange skillswapTopicExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean Queue sessionReportQueue() {
        return QueueBuilder.durable(SESSION_REPORT_QUEUE).build();
    }

    @Bean Binding sessionReportBinding(Queue sessionReportQueue, TopicExchange skillswapTopicExchange) {
        return BindingBuilder.bind(sessionReportQueue).to(skillswapTopicExchange)
                .with(SESSION_REPORT_SUBMITTED_KEY);
    }

    @Bean JacksonJsonMessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
