package com.synora.modules.user;

import com.synora.BaseIntegrationTest;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class UserFollowControllerTest extends BaseIntegrationTest {

    @Test
    void getProfile_existingUser_returnsProfile() throws Exception {
        String username = uniqueUsername();
        registerAndGetToken(username);

        mockMvc.perform(get("/api/v1/users/" + username + "/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value(username));
    }

    @Test
    void getProfile_nonExistentUser_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/users/nonexistent_user_xyz/profile"))
                .andExpect(status().isNotFound());
    }

    @Test
    void toggleFollow_followAndUnfollow() throws Exception {
        String followerUsername = uniqueUsername();
        String targetUsername = uniqueUsername();

        String followerToken = registerAndGetToken(followerUsername);
        registerAndGetToken(targetUsername);

        // Get target user ID from profile
        var result = mockMvc.perform(get("/api/v1/users/" + targetUsername + "/profile"))
                .andReturn();
        String targetId = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();

        // Follow
        mockMvc.perform(post("/api/v1/users/" + targetId + "/follow")
                        .header("Authorization", "Bearer " + followerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.following").value(true));

        // Check follow stats
        mockMvc.perform(get("/api/v1/users/" + targetId + "/follow-stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.followers").value(1));

        // Unfollow
        mockMvc.perform(post("/api/v1/users/" + targetId + "/follow")
                        .header("Authorization", "Bearer " + followerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.following").value(false));

        // Check stats again
        mockMvc.perform(get("/api/v1/users/" + targetId + "/follow-stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.followers").value(0));
    }

    @Test
    void isFollowing_returnsCorrectState() throws Exception {
        String followerUsername = uniqueUsername();
        String targetUsername = uniqueUsername();

        String followerToken = registerAndGetToken(followerUsername);
        registerAndGetToken(targetUsername);

        var result = mockMvc.perform(get("/api/v1/users/" + targetUsername + "/profile"))
                .andReturn();
        String targetId = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();

        // Not following yet
        mockMvc.perform(get("/api/v1/users/" + targetId + "/is-following")
                        .header("Authorization", "Bearer " + followerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.following").value(false));

        // Follow
        mockMvc.perform(post("/api/v1/users/" + targetId + "/follow")
                        .header("Authorization", "Bearer " + followerToken))
                .andExpect(status().isOk());

        // Now following
        mockMvc.perform(get("/api/v1/users/" + targetId + "/is-following")
                        .header("Authorization", "Bearer " + followerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.following").value(true));
    }

    @Test
    void getFollowers_returnsPaginatedList() throws Exception {
        String targetUsername = uniqueUsername();
        registerAndGetToken(targetUsername);

        var result = mockMvc.perform(get("/api/v1/users/" + targetUsername + "/profile"))
                .andReturn();
        String targetId = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();

        // Create 3 followers
        for (int i = 0; i < 3; i++) {
            String followerToken = registerAndGetToken(uniqueUsername());
            mockMvc.perform(post("/api/v1/users/" + targetId + "/follow")
                            .header("Authorization", "Bearer " + followerToken))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(get("/api/v1/users/" + targetId + "/followers")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(3)));
    }

    @Test
    void topUsers_returnsRankedList() throws Exception {
        registerAndGetToken(uniqueUsername());

        mockMvc.perform(get("/api/v1/users/top")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }
}
