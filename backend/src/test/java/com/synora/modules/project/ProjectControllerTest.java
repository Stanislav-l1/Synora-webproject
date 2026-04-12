package com.synora.modules.project;

import com.synora.BaseIntegrationTest;
import com.synora.modules.project.dto.CreateProjectRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProjectControllerTest extends BaseIntegrationTest {

    @Test
    void createProject_authenticated_returns201() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("Test Project");
        req.setDescription("A test project");
        req.setPublic(true);

        mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Test Project"));
    }

    @Test
    void createProject_unauthenticated_returns401() throws Exception {
        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("No Auth Project");

        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getProjects_returnsPublicList() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("Public Project");
        req.setPublic(true);

        mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/projects")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    void getProject_existingId_returnsProject() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("Specific Project");
        req.setDescription("Find me");

        var result = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn();

        String projectId = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(get("/api/v1/projects/" + projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Specific Project"));
    }

    @Test
    void joinAndLeave_project() throws Exception {
        String ownerToken = registerAndGetToken(uniqueUsername());
        String memberToken = registerAndGetToken(uniqueUsername());

        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("Join Test Project");
        req.setPublic(true);

        var result = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn();

        String projectId = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();

        // Join
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/join")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk());

        // Check members
        mockMvc.perform(get("/api/v1/projects/" + projectId + "/members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));

        // Leave
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/leave")
                        .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk());

        // Check members again
        mockMvc.perform(get("/api/v1/projects/" + projectId + "/members"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    void deleteProject_byOwner_succeeds() throws Exception {
        String token = registerAndGetToken(uniqueUsername());

        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("To Delete");

        var result = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn();

        String projectId = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(delete("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void deleteProject_byNonOwner_returns403() throws Exception {
        String ownerToken = registerAndGetToken(uniqueUsername());
        String otherToken = registerAndGetToken(uniqueUsername());

        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("Not yours to delete");

        var result = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andReturn();

        String projectId = objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(delete("/api/v1/projects/" + projectId)
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isForbidden());
    }
}
