package com.skillswap.apigateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.apigateway.config.RateLimitProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitFilterTest {

    private static final int AUTH_LIMIT = 3;
    private static final int API_LIMIT  = 5;

    private RateLimitFilter filter;

    @BeforeEach
    void setUp() {
        filter = new RateLimitFilter(
                new RateLimitProperties(AUTH_LIMIT, API_LIMIT),
                new ObjectMapper());
    }

    @Test
    void underLimit_requestPassesThrough() throws Exception {
        var request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.getRequest()).isNotNull();
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getHeader("X-Rate-Limit-Remaining")).isNotNull();
    }

    @Test
    void exceedAuthLimit_returns429() throws Exception {
        for (int i = 0; i < AUTH_LIMIT; i++) {
            var req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            req.setRemoteAddr("10.0.0.1");
            filter.doFilterInternal(req, new MockHttpServletResponse(), new MockFilterChain());
        }

        var request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr("10.0.0.1");
        var response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, new MockFilterChain());

        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getHeader("Retry-After")).isNotNull();
        assertThat(response.getContentAsString()).contains("Too many requests");
    }

    @Test
    void exceedApiLimit_returns429() throws Exception {
        for (int i = 0; i < API_LIMIT; i++) {
            var req = new MockHttpServletRequest("GET", "/api/v1/users/me");
            req.setRemoteAddr("10.0.0.2");
            filter.doFilterInternal(req, new MockHttpServletResponse(), new MockFilterChain());
        }

        var request = new MockHttpServletRequest("GET", "/api/v1/users/me");
        request.setRemoteAddr("10.0.0.2");
        var response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, new MockFilterChain());

        assertThat(response.getStatus()).isEqualTo(429);
    }

    @Test
    void differentIps_haveIndependentBuckets() throws Exception {
        for (int i = 0; i < AUTH_LIMIT; i++) {
            var req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            req.setRemoteAddr("10.0.0.1");
            filter.doFilterInternal(req, new MockHttpServletResponse(), new MockFilterChain());
        }

        // IP2 must still pass
        var request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr("10.0.0.2");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.getRequest()).isNotNull();
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void xForwardedFor_firstIpIsUsedAsKey() throws Exception {
        for (int i = 0; i < AUTH_LIMIT; i++) {
            var req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            req.addHeader("X-Forwarded-For", "192.168.1.1, 10.0.0.100");
            filter.doFilterInternal(req, new MockHttpServletResponse(), new MockFilterChain());
        }

        var request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.addHeader("X-Forwarded-For", "192.168.1.1, 10.0.0.100");
        var response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, new MockFilterChain());

        assertThat(response.getStatus()).isEqualTo(429);
    }

    @Test
    void authAndApiPools_areIndependent() throws Exception {
        for (int i = 0; i < AUTH_LIMIT; i++) {
            var req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            req.setRemoteAddr("10.0.0.5");
            filter.doFilterInternal(req, new MockHttpServletResponse(), new MockFilterChain());
        }

        var request = new MockHttpServletRequest("GET", "/api/v1/users/me");
        request.setRemoteAddr("10.0.0.5");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.getRequest()).isNotNull();
        assertThat(response.getStatus()).isEqualTo(200);
    }
}
