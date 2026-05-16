package com.synora.modules.auth.controller;

import com.synora.modules.auth.dto.AuthResponse;
import com.synora.modules.auth.service.GitHubOAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.UUID;

@Tag(name = "OAuth", description = "Social login")
@RestController
@RequestMapping("/api/v1/auth/oauth")
@RequiredArgsConstructor
public class OAuthController {

    private final GitHubOAuthService githubOAuthService;
    private final GoogleOAuthService googleOAuthService;

    @Value("${app.public-base-url}")
    private String baseUrl;

    @Operation(summary = "Redirect to GitHub OAuth")
    @GetMapping("/github")
    public void redirectToGitHub(HttpServletResponse response) throws IOException {
        String state = UUID.randomUUID().toString();
        response.sendRedirect(githubOAuthService.buildAuthorizationUrl(state));
    }

    @Operation(summary = "GitHub OAuth callback")
    @GetMapping("/github/callback")
    public void githubCallback(
            @RequestParam String code,
            @RequestParam(required = false) String state,
            HttpServletResponse response) throws IOException {
        handleCallback(() -> githubOAuthService.handleCallback(code), response);
    }

    @Operation(summary = "Redirect to Google OAuth")
    @GetMapping("/google")
    public void redirectToGoogle(HttpServletResponse response) throws IOException {
        response.sendRedirect(googleOAuthService.buildAuthorizationUrl(UUID.randomUUID().toString()));
    }

    @Operation(summary = "Google OAuth callback")
    @GetMapping("/google/callback")
    public void googleCallback(
            @RequestParam String code,
            @RequestParam(required = false) String state,
            HttpServletResponse response) throws IOException {
        handleCallback(() -> googleOAuthService.handleCallback(code), response);
    }

    private void handleCallback(java.util.function.Supplier<AuthResponse> exchange, HttpServletResponse response) throws IOException {
        try {
            AuthResponse auth = exchange.get();
            String redirect = baseUrl + "/oauth/callback"
                    + "?accessToken=" + auth.getAccessToken()
                    + "&refreshToken=" + auth.getRefreshToken()
                    + "&expiresIn=" + auth.getExpiresIn();
            response.sendRedirect(redirect);
        } catch (Exception e) {
            response.sendRedirect(baseUrl + "/login?error=oauth_failed");
        }
    }
}
