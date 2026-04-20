package com.synora.modules.message;

import com.synora.BaseIntegrationTest;
import com.synora.modules.auth.dto.RegisterRequest;
import com.synora.modules.message.dto.CreateChatRequest;
import com.synora.modules.message.entity.ChatType;
import com.synora.modules.project.dto.CreateProjectRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ChatControllerTest extends BaseIntegrationTest {

    // --- helpers ---

    private record RegisteredUser(String username, String token, UUID id) {}

    private RegisteredUser registerUser() throws Exception {
        String username = uniqueUsername();

        RegisterRequest req = new RegisterRequest();
        req.setUsername(username);
        req.setEmail(username + "@test.com");
        req.setPassword("Password123!");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        var node = objectMapper.readTree(result.getResponse().getContentAsString());
        String token = node.at("/data/accessToken").asText();
        UUID id = UUID.fromString(node.at("/data/userId").asText());
        return new RegisteredUser(username, token, id);
    }

    private String createProject(String ownerToken, String name, boolean isPublic) throws Exception {
        CreateProjectRequest req = new CreateProjectRequest();
        req.setName(name);
        req.setPublic(isPublic);
        MvcResult result = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();
    }

    private String createGroupChat(String creatorToken, List<UUID> memberIds) throws Exception {
        CreateChatRequest req = new CreateChatRequest();
        req.setType(ChatType.GROUP);
        req.setName("Team chat " + UUID.randomUUID().toString().substring(0, 6));
        req.setMemberIds(memberIds);
        MvcResult result = mockMvc.perform(post("/api/v1/chats/group")
                        .header("Authorization", "Bearer " + creatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .at("/data/id").asText();
    }

    // --- getOrCreateProjectChat ---

    @Test
    void getOrCreateProjectChat_forbiddenForNonMember() throws Exception {
        RegisteredUser owner = registerUser();
        RegisteredUser outsider = registerUser();

        String projectId = createProject(owner.token(), "Secret Project", false);

        mockMvc.perform(get("/api/v1/chats/project/" + projectId)
                        .header("Authorization", "Bearer " + outsider.token()))
                .andExpect(status().isForbidden());
    }

    @Test
    void getOrCreateProjectChat_memberGetsChat_idempotent() throws Exception {
        RegisteredUser owner = registerUser();
        String projectId = createProject(owner.token(), "Idempotent Project", true);

        MvcResult first = mockMvc.perform(get("/api/v1/chats/project/" + projectId)
                        .header("Authorization", "Bearer " + owner.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.type").value("PROJECT"))
                .andExpect(jsonPath("$.data.projectId").value(projectId))
                .andReturn();

        String firstChatId = objectMapper.readTree(first.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(get("/api/v1/chats/project/" + projectId)
                        .header("Authorization", "Bearer " + owner.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(firstChatId));
    }

    @Test
    void getOrCreateProjectChat_reconcilesMembership() throws Exception {
        RegisteredUser owner = registerUser();
        RegisteredUser joiner = registerUser();

        String projectId = createProject(owner.token(), "Reconcile Project", true);

        // Owner creates the project chat first (seeded with only owner)
        mockMvc.perform(get("/api/v1/chats/project/" + projectId)
                        .header("Authorization", "Bearer " + owner.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.members.length()").value(1));

        // A new user joins the project
        mockMvc.perform(post("/api/v1/projects/" + projectId + "/join")
                        .header("Authorization", "Bearer " + joiner.token()))
                .andExpect(status().isOk());

        // Owner fetches project chat again — should include the new member
        mockMvc.perform(get("/api/v1/chats/project/" + projectId)
                        .header("Authorization", "Bearer " + owner.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.members.length()").value(greaterThanOrEqualTo(2)));
    }

    // --- addMember (GROUP chats) ---

    @Test
    void addMember_asAdmin_toGroup_returns201() throws Exception {
        RegisteredUser creator = registerUser();
        RegisteredUser invitee = registerUser();
        RegisteredUser newcomer = registerUser();

        String chatId = createGroupChat(creator.token(), List.of(invitee.id()));

        mockMvc.perform(post("/api/v1/chats/" + chatId + "/members/" + newcomer.id())
                        .header("Authorization", "Bearer " + creator.token()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.userId").value(newcomer.id().toString()));
    }

    @Test
    void addMember_asNonAdmin_returns403() throws Exception {
        RegisteredUser creator = registerUser();
        RegisteredUser invitee = registerUser();
        RegisteredUser newcomer = registerUser();

        String chatId = createGroupChat(creator.token(), List.of(invitee.id()));

        // invitee is non-admin — cannot add others
        mockMvc.perform(post("/api/v1/chats/" + chatId + "/members/" + newcomer.id())
                        .header("Authorization", "Bearer " + invitee.token()))
                .andExpect(status().isForbidden());
    }

    @Test
    void addMember_toDirectChat_returns400() throws Exception {
        RegisteredUser alice = registerUser();
        RegisteredUser bob = registerUser();
        RegisteredUser charlie = registerUser();

        MvcResult direct = mockMvc.perform(post("/api/v1/chats/direct/" + bob.id())
                        .header("Authorization", "Bearer " + alice.token()))
                .andExpect(status().isOk())
                .andReturn();
        String directChatId = objectMapper.readTree(direct.getResponse().getContentAsString())
                .at("/data/id").asText();

        mockMvc.perform(post("/api/v1/chats/" + directChatId + "/members/" + charlie.id())
                        .header("Authorization", "Bearer " + alice.token()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void addMember_duplicate_returns409() throws Exception {
        RegisteredUser creator = registerUser();
        RegisteredUser invitee = registerUser();

        String chatId = createGroupChat(creator.token(), List.of(invitee.id()));

        // invitee was added at creation — re-adding must conflict
        mockMvc.perform(post("/api/v1/chats/" + chatId + "/members/" + invitee.id())
                        .header("Authorization", "Bearer " + creator.token()))
                .andExpect(status().isConflict());
    }

    // --- removeMember ---

    @Test
    void removeMember_selfLeave_allowedForNonAdmin() throws Exception {
        RegisteredUser creator = registerUser();
        RegisteredUser member = registerUser();

        String chatId = createGroupChat(creator.token(), List.of(member.id()));

        mockMvc.perform(delete("/api/v1/chats/" + chatId + "/members/" + member.id())
                        .header("Authorization", "Bearer " + member.token()))
                .andExpect(status().isOk());
    }

    @Test
    void removeMember_asAdmin_removesOther() throws Exception {
        RegisteredUser creator = registerUser();
        RegisteredUser member = registerUser();

        String chatId = createGroupChat(creator.token(), List.of(member.id()));

        mockMvc.perform(delete("/api/v1/chats/" + chatId + "/members/" + member.id())
                        .header("Authorization", "Bearer " + creator.token()))
                .andExpect(status().isOk());
    }

    @Test
    void removeMember_asNonAdmin_forbidden() throws Exception {
        RegisteredUser creator = registerUser();
        RegisteredUser memberA = registerUser();
        RegisteredUser memberB = registerUser();

        String chatId = createGroupChat(creator.token(), List.of(memberA.id(), memberB.id()));

        // memberA tries to kick memberB — not admin, not self → forbidden
        mockMvc.perform(delete("/api/v1/chats/" + chatId + "/members/" + memberB.id())
                        .header("Authorization", "Bearer " + memberA.token()))
                .andExpect(status().isForbidden());
    }
}
