---
name: synora-todo
description: Show and navigate the Synora platform build roadmap — completed steps, current progress, and what to do next.
user-invocable: true
---

# Synora Platform — Build Roadmap

You are a project manager for the Synora platform — a production-ready IT community web platform (social network + projects + real-time chat + code collaboration).

When invoked, display the full roadmap with current status, then ask the user what to work on next.

## The Roadmap

Work through these steps IN ORDER. Each step produces concrete artifacts: code, configs, or schemas.

```
STEP  STATUS  DESCRIPTION
────────────────────────────────────────────────────────────────────
 1    ✅ DONE  Architecture — system design, tech stack, folder structure
 2    ✅ DONE  Database — Flyway migrations V1–V7, application.yml
 3    ✅ DONE  Backend core — pom.xml, Security, JWT, Auth module, User module
 4    ✅ DONE  Backend modules — Posts, Comments, Projects, Tasks (Kanban)
 5    ✅ DONE  Backend real-time — WebSocket chat (Messages module)
 6    ⬜ TODO  Backend extras — Notifications, Search, Reputation, File upload (S3)
 7    ⬜ TODO  DevOps — Dockerfile (fe+be), docker-compose, Nginx reverse proxy
 8    ⬜ TODO  CI/CD — GitHub Actions pipeline (build → test → deploy)
 9    ⬜ TODO  Frontend setup — Next.js 14, Tailwind, Zustand, API client
10    ⬜ TODO  Frontend pages — Home (feed), Profile, Projects, Messages, Auth
11    ⬜ TODO  Frontend components — PostCard, ProjectCard, Chat, Navbar, KanbanBoard
12    ⬜ TODO  Testing — Backend unit/integration (Testcontainers), Frontend (Jest)
13    ⬜ TODO  Logging & monitoring — Logback, Prometheus, Grafana, health checks
14    ⬜ TODO  Performance — Redis caching, pagination, lazy loading
15    ⬜ TODO  Deploy guide — env vars, production config, deployment instructions
```

## What's already built

### Step 1 — Architecture
- System diagram (Nginx → Spring Boot → PostgreSQL/Redis/S3)
- Full folder structure for backend and frontend
- ER-diagram overview
- Tech stack decisions documented

### Step 2 — Database
- `V1__create_users.sql` — users, user_skills, refresh_tokens + GIN search index
- `V2__create_posts.sql` — posts, comments, tags, likes, bookmarks
- `V3__create_projects.sql` — projects, project_members, tasks, kanban_columns
- `V4__create_messages.sql` — chats, chat_members, messages, attachments, reactions
- `V5__create_notifications.sql` — notifications, user_follows
- `V6__create_files_reputation.sql` — file_uploads, reputation_events, reports, audit_logs
- `V7__seed_data.sql` — 20 base tags
- `application.yml` — full Spring Boot config (DB, Redis, JWT, S3, Flyway, Actuator)

### Step 5 — Backend real-time (WebSocket chat)
- `ChatType` enum, `Chat`, `ChatMember`, `ChatMemberId`, `Message` entities
- `ChatRepository` (with findDirectChat + findByMember queries), `ChatMemberRepository`, `MessageRepository` (with countUnread)
- DTOs: `CreateChatRequest`, `ChatResponse`, `ChatMemberResponse`, `MessageResponse`, `SendMessageRequest`, `WsMessage`
- `ChatService` — create/get DIRECT chat, create GROUP chat, markRead, assertMember
- `MessageService` — getHistory, sendMessage (+ STOMP broadcast to `/topic/chat.{id}`), editMessage, deleteMessage
- `ChatController` — `GET /api/v1/chats`, `POST /direct/{userId}`, `POST /group`, `POST /{chatId}/read`
- `MessageController` — REST CRUD + `@MessageMapping("/chat/{chatId}/send")` STOMP handler
- `WebSocketSecurityConfig` — `ChannelInterceptor` that validates JWT on STOMP CONNECT and sets `Principal`

### Step 4 — Backend modules
- `PostStatus`, `Tag`, `Post`, `Comment`, `PostLike`, `PostBookmark` entities
- `PostStatus` / `PostStatus` / `MemberRole` / `TaskStatus` / `TaskPriority` enums
- `ProjectStatus`, `MemberRole`, `TaskStatus`, `TaskPriority` enums
- `Project`, `ProjectMember`, `KanbanColumn`, `Task` entities
- `TagRepository`, `PostRepository`, `CommentRepository`, `PostLikeRepository`, `PostBookmarkRepository`
- `ProjectRepository`, `ProjectMemberRepository`, `KanbanColumnRepository`, `TaskRepository`
- DTOs: `CreatePostRequest`, `UpdatePostRequest`, `PostResponse`, `PostSummaryResponse`, `CommentResponse`, `CreateCommentRequest`, `TagResponse`
- DTOs: `CreateProjectRequest`, `UpdateProjectRequest`, `ProjectResponse`, `ProjectSummaryResponse`, `CreateTaskRequest`, `UpdateTaskRequest`, `MoveTaskRequest`, `TaskResponse`, `KanbanBoardResponse`, `KanbanColumnResponse`, `CreateKanbanColumnRequest`, `ProjectMemberResponse`
- `TagService`, `PostService` (CRUD + like/bookmark toggle), `CommentService` (create/soft-delete)
- `ProjectService` (CRUD + join/leave), `TaskService` (CRUD + move + Kanban column management)
- `TagController` `/api/v1/tags`, `PostController` `/api/v1/posts`, `CommentController` `/api/v1/posts/{postId}/comments`
- `ProjectController` `/api/v1/projects`, `TaskController` `/api/v1/projects/{projectId}/tasks|board|columns`

### Step 3 — Backend core
- `pom.xml` — Spring Boot 3.3, Security, JPA, Redis, Flyway, JWT (JJWT 0.12), MapStruct, Lombok, Testcontainers
- `SynoraApplication.java` — entry point with `@EnableJpaAuditing` + `@EnableAsync`
- `SecurityConfig.java` — STATELESS, CORS, whitelist, `@EnableMethodSecurity`
- `JwtAuthFilter.java` — `OncePerRequestFilter`, extracts JWT → sets `SecurityContext`
- `JwtUtil.java` — generate/validate access tokens (JJWT 0.12 API)
- `RedisConfig.java` — `RedisTemplate` + `RedisCacheManager` with per-cache TTLs
- `WebSocketConfig.java` — STOMP `/ws`, brokers `/topic` + `/queue`
- `ApiResponse<T>` + `PageResponse<T>` — unified response wrappers
- `AppException` — factory methods: `notFound`, `forbidden`, `conflict`, `badRequest`, `unauthorized`
- `GlobalExceptionHandler` — handles validation, JWT, access denied, file size, generic errors
- `AuthService` — register, login, **refresh with rotation**, logout
- `AuthController` — `/api/v1/auth/{register,login,refresh,logout,me}`
- `UserDetailsServiceImpl` — loads user by username for Spring Security
- `User` entity — JPA + `UserDetails` impl, `UserRole` enum
- `UserService` — `@Cacheable` profiles, PATCH update, top by reputation
- `UserController` — `/api/v1/users/{username}/profile`, PATCH `/me`, `/top`

## Architecture Reference

When designing or reviewing any module, follow this architecture prompt:

> You are a senior software architect.
>
> Design backend architecture for IT community platform.
>
> **Architecture requirements:**
>
> 1. Use hybrid architecture:
>    - Core system as modular monolith
>    - Separate services for heavy features
>
> 2. Follow architecture principles similar to GitHub:
>    - Start with monolith
>    - Extract services when needed
>    - Use event-driven approach for async tasks
>
> 3. Structure:
>
>    Core (monolith): user module, post module, project module, comment module
>
>    Separate services: realtime chat (WebSocket), notifications service, code repository service (git-like), search service
>
> 4. Apply patterns: Clean Architecture, Service Layer, Repository Pattern, DTO pattern
>
> 5. Include: REST API, JWT authentication, role-based access
>
> 6. Show: folder structure, module separation, data flow between modules
>
> Keep it scalable and production-ready.

## How to display this skill

When the user invokes `/synora-todo`:

1. Print the roadmap table above with ✅/⬜ status for each step
2. Show a brief summary of what was built in each completed step
3. Highlight the **next recommended step** in bold
4. Ask: "Which step should we work on?" — offer the next logical step as default, but let the user choose any step

## Rules for each step

- Always produce **working code**, not pseudocode
- Create actual files in the repo at the correct paths
- Follow existing conventions: package names, response wrappers, exception patterns
- Use `TodoWrite` to track progress within the session
- At the end of each step, update this SKILL.md to mark it ✅ DONE and fill in the "What's already built" section

## File locations

```
Backend:  c:/Users/stas5/Synora-proj/backend/
Frontend: c:/Users/stas5/Synora-proj/frontend/   (not created yet)
DevOps:   c:/Users/stas5/Synora-proj/            (docker-compose, nginx)
CI/CD:    c:/Users/stas5/Synora-proj/.github/workflows/
```
