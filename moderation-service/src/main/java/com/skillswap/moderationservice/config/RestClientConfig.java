package com.skillswap.moderationservice.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean("restClientBuilder")
    @Primary
    RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }

    @Bean
    @LoadBalanced
    @Qualifier("loadBalancedRestClientBuilder")
    RestClient.Builder loadBalancedRestClientBuilder() {
        return RestClient.builder();
    }

    @Bean("skillRestClient")
    RestClient skillRestClient(
            @Qualifier("loadBalancedRestClientBuilder") RestClient.Builder builder,
            @Value("${services.skill-service.base-url:http://skill-service}") String baseUrl) {
        return builder.baseUrl(baseUrl).build();
    }

    @Bean("userRestClient")
    RestClient userRestClient(
            @Qualifier("loadBalancedRestClientBuilder") RestClient.Builder builder,
            @Value("${services.user-service.base-url:http://user-service}") String baseUrl) {
        return builder.baseUrl(baseUrl).build();
    }
}
