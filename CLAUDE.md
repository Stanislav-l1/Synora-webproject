# Synora — Project Rules

## What is Synora

Synora — аналог GitHub, но с социальной составляющей. Ключевые отличия:

- **Проекты и коллаборация** — создание, управление и шаринг проектов с канбан-досками, задачами и ролями (как GitHub, но с упрощённым UX)
- **Социальная лента** — посты, комменты, лайки, закладки, теги (как Dev.to / Threads) — обычный чат и обсуждения прямо в платформе
- **Реалтайм чат** — личные и групповые чаты (как Threads / Slack), интегрированные с проектами
- **Курсы и обучение** — сообщества подключаются к платформе и ведут полноценные курсы, обучалки, собрания и ивенты (как в ВК)
- **Репутация** — система очков за активность и вклад в сообщество

Целевая аудитория — разработчики и IT-сообщества. Единая платформа для кода, общения, обучения и ивентов.

Hybrid architecture — modular monolith core with extractable services.

## Tech Stack

- **Backend:** Java 21, Spring Boot 3.3, PostgreSQL 16, Redis, MinIO (S3)
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Axios, STOMP.js
- **Auth:** JWT (JJWT 0.12.6), stateless, refresh token rotation
- **Realtime:** Spring WebSocket STOMP, SockJS fallback
- **Migrations:** Flyway (ddl-auto: validate — JPA never touches schema)
- **Docs:** SpringDoc OpenAPI 2.5 (Swagger UI)

## Project Structure

### Backend
```
backend/src/main/java/com/synora/
├── config/              # SecurityConfig, JwtAuthFilter, RedisConfig, S3Config, WebSocket configs
├── modules/
│   ├── auth/            # register, login, refresh rotation, logout
│   ├── user/            # profiles, follows (UserFollow, FollowService, FollowController)
│   ├── post/            # posts, comments, tags, likes, bookmarks
│   ├── project/         # projects, members, tasks, kanban columns
│   ├── message/         # chats (direct/group), messages, WebSocket handlers
│   ├── notification/    # real-time notifications via WebSocket push
│   ├── search/          # full-text search (posts, projects, users)
│   ├── reputation/      # reputation points, events, milestones
│   ├── file/            # S3/MinIO file upload, presigned URLs
│   └── report/          # user reports, admin review (AdminReportController)
└── shared/
    ├── dto/             # ApiResponse<T>, PageResponse<T>
    ├── exception/       # AppException, GlobalExceptionHandler
    └── util/            # JwtUtil

backend/src/main/resources/
├── application.yml
└── db/migration/        # V1–V7 Flyway scripts
```

### Frontend
```
frontend/
├── next.config.js       # standalone output, API rewrites to :8080
├── tailwind.config.js   # design tokens: accent, surface, content, border palettes
├── package.json         # Next.js 14, Zustand, Axios, STOMP.js, Lucide, date-fns
└── src/
    ├── app/
    │   ├── layout.tsx       # RootLayout (html dark class, globals.css import)
    │   ├── globals.css      # Tailwind layers, scrollbar, selection, focus-ring, glass
    │   ├── (auth)/
    │   │   ├── login/       # email/password, GitHub/Google OAuth, remember me
    │   │   └── register/    # registration form with real-time password validation
    │   ├── feed/            # compose box + PostCard feed + RightPanel
    │   ├── projects/        # tabs (my/starred/explore), grid/list toggle, ProjectCards
    │   ├── profile/         # banner, avatar, bio, stats, skills, TabBar content
    │   ├── messages/        # two-panel chat: chat list + message area + input
    │   ├── search/          # global search (TODO)
    │   └── settings/        # user settings (TODO)
    ├── components/
    │   ├── ui/              # UI-kit (index.ts barrel export)
    │   │   ├── button.tsx   # 4 variants (primary/secondary/ghost/danger), 3 sizes, loading, icon
    │   │   ├── avatar.tsx   # 5 sizes, initials fallback, hash-color, online indicator
    │   │   ├── badge.tsx    # 6 variants (default/accent/success/warning/danger/info)
    │   │   ├── input.tsx    # Input + Textarea, label, error, icon
    │   │   ├── card.tsx     # Card + CardHeader/CardContent/CardFooter, hover, padding variants
    │   │   └── tab-bar.tsx  # underline tabs with count badge
    │   ├── layout/          # index.ts barrel export
    │   │   ├── navbar.tsx   # sticky, glass-blur, search, notifications, avatar
    │   │   ├── sidebar.tsx  # 240px, collapsible, main/secondary nav, trending tags
    │   │   ├── right-panel.tsx # trending topics, who-to-follow, user stats
    │   │   └── app-shell.tsx   # Navbar + Sidebar + content wrapper (client component)
    │   └── shared/          # index.ts barrel export
    │       ├── post-card.tsx    # author, content, tags, image, like/comment/bookmark/share
    │       └── project-card.tsx # gradient cover, tags, members, stars, progress bar
    ├── lib/
    │   ├── api.ts           # Axios instance, JWT interceptors, auto-refresh (TODO)
    │   ├── auth.ts          # token storage helpers (TODO)
    │   └── utils.ts         # cn() (clsx + tailwind-merge)
    ├── store/               # Zustand stores (TODO: auth, notifications, chat)
    ├── hooks/               # useAuth, useWebSocket (TODO)
    └── types/
        └── api.ts           # ApiResponse<T>, PageResponse<T>, ApiError
```

### DevOps
```
docker-compose.yml       # postgres, redis, minio, backend, nginx
backend/Dockerfile       # multi-stage (JDK build → JRE runtime), non-root user
nginx/
├── nginx.conf           # gzip, security headers, client_max_body_size 100M
└── conf.d/default.conf  # reverse proxy: /api, /ws (upgrade), /swagger-ui
.github/workflows/
├── ci.yml               # build + test (Postgres, Redis, MinIO services), OWASP check
└── cd.yml               # Docker build → GHCR push, staging/prod deploy
```

## Code Conventions

### Response Wrapper
ALL controller responses must use `ApiResponse<T>`:
```java
return ResponseEntity.ok(ApiResponse.ok(data));
return ResponseEntity.ok(ApiResponse.ok("Message", data));
```

### Pagination
ALL paginated endpoints must use `PageResponse<T>`:
```java
return PageResponse.from(repository.findAll(pageable).map(this::toResponse));
```

### Exceptions
Use `AppException` factory methods — never throw raw exceptions from services:
```java
throw AppException.notFound("Entity", id);
throw AppException.forbidden();
throw AppException.conflict("Already exists");
throw AppException.badRequest("Invalid input");
throw AppException.unauthorized("Bad credentials");
```

### Entities
- UUID primary keys with `@GeneratedValue(strategy = GenerationType.UUID)`
- PostgreSQL ENUM types mapped with `@JdbcTypeCode(SqlTypes.NAMED_ENUM)`
- `@EntityListeners(AuditingEntityListener.class)` for `@CreatedDate` / `@LastModifiedDate`
- `@Builder.Default` on every field that has a default value
- Composite keys use `@Embeddable` + `@EmbeddedId` (not `@IdClass`)

### DTOs
- Responses: `@Getter @Builder`, optionally `@JsonInclude(NON_NULL)`
- Requests: `@Data` with Jakarta Validation annotations (`@NotBlank`, `@Size`, etc.)
- No entity leaking — always map through builder in service layer

### Services
- `@Transactional(readOnly = true)` on reads, `@Transactional` on writes
- `@Cacheable` / `@CacheEvict` where appropriate (cache names: users, posts, projects, tags)
- Permission checks inside service methods, not controllers
- Manual mapping via builder (no MapStruct — keep it simple)

### Controllers
- Class-level `@RequestMapping("/api/v1/...")` — always versioned
- Swagger annotations: `@Tag`, `@Operation`, `@SecurityRequirement`
- `@AuthenticationPrincipal User currentUser` for authenticated endpoints
- POST returns `HttpStatus.CREATED`, everything else returns 200

### Caching (Redis)
- `users` — 30min TTL
- `posts` — 5min TTL
- `projects` — 15min TTL
- `tags` — 1h TTL
- Default — 10min TTL

## Database Rules

- **Flyway owns the schema.** Never use `ddl-auto: create/update`. Only `validate`.
- All migrations in `V{N}__description.sql` format
- UUIDs for all primary keys (prevents enumeration)
- `TIMESTAMPTZ` for all timestamps
- `created_at` / `updated_at` on every mutable table
- PostgreSQL custom ENUMs (not VARCHAR) for status fields
- GIN indexes with `pg_trgm` for full-text search
- Composite primary keys for join tables (post_tags, post_likes, etc.)

## Security Rules

- JWT access token: 15min, refresh token: 7 days with rotation
- `SecurityConfig` whitelists: register/login/refresh as PUBLIC_POST, feeds/profiles as PUBLIC_GET
- WebSocket STOMP: JWT validated in `ChannelInterceptor` on CONNECT frame
- Admin endpoints: `/api/v1/admin/**` requires `ROLE_ADMIN`
- CORS: `localhost:3000` (dev), `*.synora.io` (prod)
- BCrypt strength 12 for password hashing

## WebSocket Conventions

- STOMP endpoint: `/ws` with SockJS fallback
- App prefix: `/app` (client sends to `/app/chat/{chatId}/send`)
- Broker prefixes: `/topic` (broadcast), `/queue` (point-to-point)
- User prefix: `/user` (per-user destinations)
- Broadcast: `SimpMessagingTemplate.convertAndSend("/topic/chat.{chatId}", response)`

## What NOT to Do

- Do not create entities for tables that don't have a migration yet
- Do not add `@Transactional` to controllers — only services
- Do not use `@IdClass` — use `@EmbeddedId` with `@Embeddable`
- Do not bypass `AppException` — all error responses go through `GlobalExceptionHandler`
- Do not use `Instant.now()` as field default in entities — use `@CreatedDate` or DB DEFAULT
- Do not add new caches without configuring TTL in `RedisConfig`
- Do not skip `@Builder.Default` when a field has an initializer

## Frontend Conventions

### Design System (Tailwind tokens in `tailwind.config.js`)
- **Accent:** `#6C5CE7` (purple) — primary interactive color, with hover/muted/light variants
- **Surfaces:** 4 levels — `primary (#0A0A0B)`, `secondary (#111113)`, `tertiary (#1A1A1F)`, `input (#16161A)`
- **Content text:** 3 levels — `primary (#EDEDEF)`, `secondary (#8B8B8E)`, `tertiary (#5C5C63)`
- **Borders:** `default (#222228)`, `hover (#2E2E36)`, `accent (#6C5CE7)`
- **Semantic:** success/warning/danger/info — each with `DEFAULT` and `muted` variant
- **Fonts:** Inter (sans), JetBrains Mono (mono)
- **Dark theme first** — `<html class="dark">`, light theme planned

### Layout System
- **Navbar:** 56px height, sticky, glass-blur background
- **Sidebar:** 240px width, fixed on `lg+`, slide-in drawer on mobile with overlay
- **RightPanel:** 320px, visible on `xl+` only
- **Content:** `pt-navbar lg:pl-sidebar`, feed max-width 640px
- **AppShell** wraps all authenticated pages (Navbar + Sidebar + content)
- **(auth)** route group has NO layout shell (standalone centered forms)

### UI Components Rules
- All UI components live in `components/ui/`, exported through `index.ts`
- All accept `className` prop, merge with `cn()` (clsx + tailwind-merge)
- Button: use `variant` and `size` props, supports `loading` and `icon`
- Avatar: always pass `name` (used for initials fallback and color hash)
- Card: compose with `CardHeader` / `CardContent` / `CardFooter`
- TabBar: controlled component — pass `activeTab` and `onChange`

### Shared Components Rules
- `PostCard` — used in feed and profile, all social actions (like/comment/bookmark/share)
- `ProjectCard` — used in projects list and profile, auto-gradient cover from project name hash
- New shared components go to `components/shared/` with barrel export in `index.ts`

### API Client
- Single Axios instance in `lib/api.ts` with base URL from `NEXT_PUBLIC_API_URL`
- Request interceptor attaches `Authorization: Bearer <token>` from localStorage
- Response interceptor catches 401 → attempts refresh token rotation → retries original request
- On refresh failure → clears tokens, redirects to `/login`

### State Management (Zustand)
- `useAuthStore` — user, tokens, login/logout/refresh actions
- `useNotificationStore` — notifications list, unread count, WebSocket subscription
- `useChatStore` — active chat, messages, typing indicators

### File Structure Rules
- One component per file, named export matching filename
- Colocate page-specific components in the page directory
- Shared types in `types/`, never inline complex types
- Barrel exports (`index.ts`) in `ui/`, `layout/`, `shared/` — import from folder, not file

## Testing

### Integration Tests (Testcontainers)
- **38 tests** across 5 test classes — all passing
- `BaseIntegrationTest` — singleton PostgreSQL 16 + Redis 7 containers (shared across all test classes)
- Test classes: `AuthControllerTest` (11), `PostControllerTest` (9), `ProjectControllerTest` (7), `SearchControllerTest` (5), `UserFollowControllerTest` (6)
- Profile: `application-test.yml` — JWT secret must be Base64-encoded (JwtUtil decodes Base64)
- `api.version=1.44` in maven-surefire-plugin — required for Docker Desktop 29.x compatibility

### Running Tests
```bash
cd backend
mvn test -Dspring.profiles.active=test
```

### Test Pitfalls
- **Docker Desktop 29.x**: requires `api.version=1.44` system property (Docker 29 raised minimum API version, docker-java defaults to 1.32)
- **Singleton containers**: do NOT use `@Container` per-class — Spring caches ApplicationContext with ports from first container set; use `static { container.start(); }` block instead
- **SearchService.escapeLike**: escapes `_` and `%` in LIKE patterns — test search queries must not contain these characters
- **SecurityConfig**: `HttpStatusEntryPoint(UNAUTHORIZED)` ensures 401 (not 403) for unauthenticated requests

## Logging & Monitoring

- **Logback**: dev — colored console with MDC requestId; prod — JSON structured logging + rolling file
- **RequestLoggingFilter**: MDC requestId (from `X-Request-Id` header or generated UUID), response timing, userId from SecurityContext
- **Prometheus metrics**: `synora.users.registrations`, `synora.posts.created`, `synora.projects.created`, `synora.messages.sent`, `synora.auth.failures`, `synora.reports.submitted`
- **AsyncConfig**: `@EnableAsync`, ThreadPoolTaskExecutor (4-16 threads, 100 queue), MDC-propagating TaskDecorator

## Build & Run

```bash
# Full stack (Docker)
docker compose up -d

# Backend only
cd backend
./mvnw spring-boot:run

# Frontend only
cd frontend
npm install && npm run dev

# Tests
cd backend
mvn test -Dspring.profiles.active=test

# Requires: PostgreSQL 16, Redis, MinIO (or docker-compose)
# Dev tools: JDK 21 (~/.jdks/jdk21.0.10_7), Maven 3.9.9 (~/.jdks/apache-maven-3.9.9)
```

## Roadmap Tracking

Use `/synora-todo` skill to see current progress and pick next step.
