package com.skillswap.apigateway.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
class JwtConfig {

    @Bean
    RSAPublicKey jwtPublicKey(JwtProperties properties) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
        byte[] keyBytes;
        try (var stream = properties.publicKey().getInputStream()) {
            keyBytes = stream.readAllBytes();
        }
        String pem = new String(keyBytes, StandardCharsets.US_ASCII)
                .replaceAll("\\s+", "")
                .replace("-----BEGINPUBLICKEY-----", "")
                .replace("-----ENDPUBLICKEY-----", "");
        byte[] decoded = Base64.getDecoder().decode(pem);
        return (RSAPublicKey) KeyFactory.getInstance("RSA")
                .generatePublic(new X509EncodedKeySpec(decoded));
    }
}