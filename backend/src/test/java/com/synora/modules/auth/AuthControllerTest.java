package com.synora.modules.auth;

import com.synora.BaseIntegrationTest;
import com.synora.modules.auth.dto.LoginRequest;
import com.synora.modules.auth.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthControllerTest extends BaseIntegrationTest {

    @Test
    void register_success() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setUsername(uniqueUsername());
        req.setEmail(req.getUsername() + "@test.com");
        req.setPassword("SecurePass1!");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.data.userId").isNotEmpty())
                .andExpect(jsonPath("$.data.username").value(req.getUsername()));
    }

    @Test
    void register_duplicateUsername_returns409() throws Exception {
        String username = uniqueUsername();

        RegisterRequest req = new RegisterRequest();
        req.setUsername(username);
        req.setEmail(username + "@test.com");
        req.setPassword("SecurePass1!");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Duplicate
        req.setEmail("other_" + username + "@test.com");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void register_invalidInput_returns400() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("ab"); // too short
        req.setEmail("not-an-email");
        req.setPassword("123"); // too short

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_success() throws Exception {
        String username = uniqueUsername();
        String password = "SecurePass1!";

        RegisterRequest regReq = new RegisterRequest();
        regReq.setUsername(username);
        regReq.setEmail(username + "@test.com");
        regReq.setPassword(password);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated());

        LoginRequest loginReq = new LoginRequest();
        loginReq.setLogin(username);
        loginReq.setPassword(password);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.username").value(username));
    }

    @Test
    void login_wrongPassword_returns401() throws Exception {
        String username = uniqueUsername();

        RegisterRequest regReq = new RegisterRequest();
        regReq.setUsername(username);
        regReq.setEmail(username + "@test.com");
        regReq.setPassword("SecurePass1!");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated());

        LoginRequest loginReq = new LoginRequest();
        loginReq.setLogin(username);
        loginReq.setPassword("WrongPassword!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refresh_success() throws Exception {
        String username = uniqueUsername();

        RegisterRequest regReq = new RegisterRequest();
        regReq.setUsername(username);
        regReq.setEmail(username + "@test.com");
        regReq.setPassword("SecurePass1!");

        var result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        String refreshToken = objectMapper.readTree(json).at("/data/refreshToken").asText();

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty());
    }

    @Test
    void refresh_invalidToken_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", "invalid-token"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refresh_tokenRotation_oldTokenInvalid() throws Exception {
        String username = uniqueUsername();

        RegisterRequest regReq = new RegisterRequest();
        regReq.setUsername(username);
        regReq.setEmail(username + "@test.com");
        regReq.setPassword("SecurePass1!");

        var result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andReturn();

        String json = result.getResponse().getContentAsString();
        String refreshToken = objectMapper.readTree(json).at("/data/refreshToken").asText();

        // First refresh — works
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
                .andExpect(status().isOk());

        // Second refresh with same token — should fail (rotation)
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_authenticated_returnsUser() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNotEmpty())
                .andExpect(jsonPath("$.data.username").isNotEmpty());
    }

    @Test
    void me_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logout_invalidatesRefreshToken() throws Exception {
        String username = uniqueUsername();

        RegisterRequest regReq = new RegisterRequest();
        regReq.setUsername(username);
        regReq.setEmail(username + "@test.com");
        regReq.setPassword("SecurePass1!");

        var result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andReturn();

        String json = result.getResponse().getContentAsString();
        String accessToken = objectMapper.readTree(json).at("/data/accessToken").asText();
        String refreshToken = objectMapper.readTree(json).at("/data/refreshToken").asText();

        // Logout
        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        // Refresh token should be invalid now
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
                .andExpect(status().isUnauthorized());
    }
}
