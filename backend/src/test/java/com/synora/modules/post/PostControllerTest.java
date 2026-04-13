package com.synora.modules.post;

import com.synora.BaseIntegrationTest;
import com.synora.modules.post.dto.CreatePostRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PostControllerTest extends BaseIntegrationTest {

    @Test
    void createPost_authenticated_returns201() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        CreatePostRequest req = new CreatePostRequest();
        req.setTitle("Test Post");
        req.setContent("This is a test post content");

        mockMvc.perform(post("/api/v1/posts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Test Post"))
                .andExpect(jsonPath("$.data.content").value("This is a test post content"));
    }

    @Test
    void createPost_unauthenticated_returns401() throws Exception {
        CreatePostRequest req = new CreatePostRequest();
        req.setTitle("Test Post");
        req.setContent("Content");

        mockMvc.perform(post("/api/v1/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createPost_blankTitle_returns400() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        CreatePostRequest req = new CreatePostRequest();
        req.setTitle(""); // blank
        req.setContent("Content");

        mockMvc.perform(post("/api/v1/posts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getFeed_returnsPagedPosts() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        // Create two posts
        for (int i = 1; i <= 2; i++) {
            CreatePostRequest req = new CreatePostRequest();
            req.setTitle("Post " + i);
            req.setContent("Content " + i);

            mockMvc.perform(post("/api/v1/posts")
                            .header("Authorization", "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(get("/api/v1/posts")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").isNumber());
    }

    @Test
    void getPost_existingId_returnsPost() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        CreatePostRequest req = new CreatePostRequest();
        req.setTitle("Specific Post");
        req.setContent("Specific content");

        var result = mockMvc.perform(post("/api/v1/posts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        String postId = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(get("/api/v1/posts/" + postId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Specific Post"));
    }

    @Test
    void toggleLike_togglesTwice() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        CreatePostRequest req = new CreatePostRequest();
        req.setTitle("Likeable Post");
        req.setContent("Like me!");

        var result = mockMvc.perform(post("/api/v1/posts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn();

        String postId = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();

        // Like
        mockMvc.perform(post("/api/v1/posts/" + postId + "/like")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(true));

        // Unlike
        mockMvc.perform(post("/api/v1/posts/" + postId + "/like")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(false));
    }

    @Test
    void toggleBookmark_togglesTwice() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        CreatePostRequest req = new CreatePostRequest();
        req.setTitle("Bookmarkable Post");
        req.setContent("Bookmark me!");

        var result = mockMvc.perform(post("/api/v1/posts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn();

        String postId = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();

        // Bookmark
        mockMvc.perform(post("/api/v1/posts/" + postId + "/bookmark")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(true));

        // Unbookmark
        mockMvc.perform(post("/api/v1/posts/" + postId + "/bookmark")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(false));
    }

    @Test
    void deletePost_byOwner_succeeds() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        CreatePostRequest req = new CreatePostRequest();
        req.setTitle("To Delete");
        req.setContent("Delete me");

        var result = mockMvc.perform(post("/api/v1/posts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn();

        String postId = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(delete("/api/v1/posts/" + postId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Should be gone
        mockMvc.perform(get("/api/v1/posts/" + postId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void deletePost_byOtherUser_returns403() throws Exception {
        String ownerToken = registerAndGetToken(uniqueUsername());
        String otherToken = registerAndGetToken(uniqueUsername());

        CreatePostRequest req = new CreatePostRequest();
        req.setTitle("Not yours");
        req.setContent("Cannot delete");

        var result = mockMvc.perform(post("/api/v1/posts")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn();

        String postId = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(delete("/api/v1/posts/" + postId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }
}
