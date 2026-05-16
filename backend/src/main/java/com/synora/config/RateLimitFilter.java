package com.synora.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter extends OncePerRequestFilter {

    // Sensitive auth endpoints: 5 requests / minute per IP
    private static final Set<String> LIMITED = Set.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/resend-verification",
            "/api/v1/auth/2fa/complete"
    );

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket bucketFor(String key) {
        return buckets.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(5)
                        .refillIntervally(5, Duration.ofMinutes(1))
                        .build())
                .build());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        if (!"POST".equalsIgnoreCase(req.getMethod()) || !LIMITED.contains(req.getRequestURI())) {
            chain.doFilter(req, res);
            return;
        }
        String key = req.getRequestURI() + ":" + resolveIp(req);
        if (!bucketFor(key).tryConsume(1)) {
            res.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            res.setContentType("application/json");
            res.getWriter().write("{\"success\":false,\"message\":\"Too many requests. Try again in a minute.\",\"errorCode\":\"RATE_LIMITED\"}");
            return;
        }
        chain.doFilter(req, res);
    }

    private String resolveIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : req.getRemoteAddr();
    }
}
