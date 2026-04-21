package com.skillswap.apigateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.Resource;

import java.util.List;

@ConfigurationProperties(prefix = "jwt")
record JwtProperties(Resource publicKey, List<String> publicPaths) {}