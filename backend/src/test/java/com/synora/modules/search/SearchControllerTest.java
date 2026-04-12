package com.synora.modules.search;

import com.synora.BaseIntegrationTest;
import com.synora.modules.post.dto.CreatePostRequest;
import com.synora.modules.project.dto.CreateProjectRequest;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class SearchControllerTest extends BaseIntegrationTest {

    @Test
    void searchPosts_findsMatchingPosts() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        CreatePostRequest req = new CreatePostRequest();
        req.setTitle("Unique Search Term XYZ123");
        req.setContent("Post content for search test");

        mockMvc.perform(post("/api/v1/posts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/search/posts")
                        .param("q", "XYZ123")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void searchPosts_noMatchQuery_returnsEmpty() throws Exception {
        mockMvc.perform(get("/api/v1/search/posts")
                        .param("q", "nonexistentquerythatmatchesnothing9999")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)));
    }

    @Test
    void searchProjects_findsMatchingProjects() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("UniqueProjectName ABC789");
        req.setPublic(true);

        mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/search/projects")
                        .param("q", "ABC789")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void searchUsers_findsMatchingUsers() throws Exception {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        String username = "findme" + unique;
        registerAndGetToken(username);

        mockMvc.perform(get("/api/v1/search/users")
                        .param("q", "findme" + unique)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void searchPosts_specialCharacters_noInjection() throws Exception {
        // % and _ should be escaped, not treated as wildcards
        mockMvc.perform(get("/api/v1/search/posts")
                        .param("q", "%_\\")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)));
    }
}
