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
        try {
            AuthResponse auth = githubOAuthService.handleCallback(code);
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
