package com.synora.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Custom Prometheus metrics for business-level monitoring.
 */
@Configuration
public class MetricsConfig {

    @Bean
    public Counter userRegistrations(MeterRegistry registry) {
        return Counter.builder("synora.users.registrations")
                .description("Total user registrations")
                .register(registry);
    }

    @Bean
    public Counter postsCreated(MeterRegistry registry) {
        return Counter.builder("synora.posts.created")
                .description("Total posts created")
                .register(registry);
    }

    @Bean
    public Counter projectsCreated(MeterRegistry registry) {
        return Counter.builder("synora.projects.created")
                .description("Total projects created")
                .register(registry);
    }

    @Bean
    public Counter messagessSent(MeterRegistry registry) {
        return Counter.builder("synora.messages.sent")
                .description("Total chat messages sent")
                .register(registry);
    }

    @Bean
    public Counter authFailures(MeterRegistry registry) {
        return Counter.builder("synora.auth.failures")
                .description("Total authentication failures")
                .register(registry);
    }

    @Bean
    public Counter reportsSubmitted(MeterRegistry registry) {
        return Counter.builder("synora.reports.submitted")
                .description("Total user reports submitted")
                .register(registry);
    }
}
