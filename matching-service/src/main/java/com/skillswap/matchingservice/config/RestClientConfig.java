package com.skillswap.matchingservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    @LoadBalanced
    RestClient.Builder lbRestClientBuilder() {
        return RestClient.builder();
    }

    @Bean("userRestClient")
    RestClient userRestClient(
            @LoadBalanced RestClient.Builder builder,
            @Value("${services.user-service.base-url:http://user-service}") String baseUrl) {
        return builder.baseUrl(baseUrl).build();
    }

    @Bean("skillRestClient")
    RestClient skillRestClient(
            @LoadBalanced RestClient.Builder builder,
            @Value("${services.skill-service.base-url:http://skill-service}") String baseUrl) {
        return builder.baseUrl(baseUrl).build();
    }
}
