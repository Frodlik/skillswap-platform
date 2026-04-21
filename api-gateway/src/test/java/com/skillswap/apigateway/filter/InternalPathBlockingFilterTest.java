package com.skillswap.apigateway.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class InternalPathBlockingFilterTest {

    private InternalPathBlockingFilter filter;

    @BeforeEach
    void setUp() {
        filter = new InternalPathBlockingFilter();
    }

    @Test
    void shouldReturn403ForInternalPath() throws Exception {
        var request = new MockHttpServletRequest("GET", "/internal/users");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentType()).contains("application/json");
        assertThat(response.getContentAsString()).contains("Access denied");
        assertThat(chain.getRequest()).isNull(); // chain was NOT called
    }

    @Test
    void shouldReturn403ForDeepInternalSubPath() throws Exception {
        var request = new MockHttpServletRequest("POST", "/internal/admin/config/reset");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    void shouldPassThroughApiPath() throws Exception {
        var request = new MockHttpServletRequest("GET", "/api/v1/users/me");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.getRequest()).isNotNull(); // chain WAS called
    }

    @Test
    void shouldPassThroughActuatorPath() throws Exception {
        var request = new MockHttpServletRequest("GET", "/actuator/health");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.getRequest()).isNotNull();
    }
}