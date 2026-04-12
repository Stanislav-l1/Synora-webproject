# Synora

IT community platform — projects, social feed, real-time chat, courses, and reputation system.

## Quick Start

### Prerequisites

- Docker & Docker Compose V2
- Java 21 (for local backend dev)
- Node.js 20 (for local frontend dev)

### Run everything with Docker

```bash
# Copy env file and adjust if needed
cp .env.example .env

# Start all services
docker compose up -d

# Open in browser
# App:     http://localhost
# Swagger: http://localhost/swagger-ui/
# MinIO:   http://localhost:9001 (minioadmin/minioadmin)
```

### Local development

```bash
# 1. Start infrastructure only
docker compose up -d postgres redis minio minio-init

# 2. Backend
cd backend
./mvnw spring-boot:run

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

## Architecture

```
┌─────────┐     ┌─────────────┐     ┌────────────┐
│  Nginx  │────▶│  Next.js 14 │     │ PostgreSQL │
│  :80    │     │  :3000      │     │  :5432     │
└────┬────┘     └─────────────┘     └────────────┘
     │                                    ▲
     │          ┌─────────────┐           │
     └─────────▶│ Spring Boot │───────────┘
                │  :8080      │───┐
                └─────────────┘   │  ┌──────────┐
                                  ├─▶│  Redis   │
                                  │  │  :6379   │
                                  │  └──────────┘
                                  │  ┌──────────┐
                                  └─▶│  MinIO   │
                                     │  :9000   │
                                     └──────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.3, JPA, Flyway |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand |
| Auth | JWT (JJWT), stateless, refresh token rotation |
| Realtime | WebSocket STOMP + SockJS |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Storage | MinIO (S3-compatible) |
| Monitoring | Actuator + Prometheus + Micrometer |
| Proxy | Nginx |
| CI/CD | GitHub Actions → GHCR |

## API

All endpoints are versioned under `/api/v1/`.

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/register`, `/login`, `/refresh`, `/logout` |
| Users | `GET /users/{username}/profile`, `PATCH /users/me` |
| Follows | `POST /users/{id}/follow`, `GET /followers`, `/following` |
| Posts | `GET/POST /posts`, `PATCH/DELETE /posts/{id}`, `/like`, `/bookmark` |
| Comments | `GET/POST /posts/{id}/comments` |
| Projects | `GET/POST /projects`, join/leave, members, kanban |
| Tasks | `GET/POST /projects/{id}/tasks`, move |
| Chat | `GET/POST /chats`, messages via STOMP |
| Search | `GET /search/posts`, `/projects`, `/users` |
| Notifications | `GET /notifications`, mark read |
| Reputation | `GET /users/{id}/reputation` |
| Files | `POST /files/upload`, presigned URLs |
| Reports | `POST /reports`, `GET /admin/reports` |

Full Swagger docs: `/swagger-ui/`

## Monitoring

| Endpoint | Description |
|----------|-------------|
| `/actuator/health` | Service health |
| `/actuator/prometheus` | Prometheus metrics |
| `/actuator/metrics` | Spring metrics |

Custom metrics:
- `synora.users.registrations` — total registrations
- `synora.posts.created` — total posts
- `synora.projects.created` — total projects
- `synora.messages.sent` — total messages
- `synora.auth.failures` — auth failures
- `synora.reports.submitted` — reports

## Testing

```bash
cd backend

# Requires Docker (Testcontainers)
./mvnw verify
```

Integration tests use Testcontainers (PostgreSQL 16 + Redis 7) — no mocks for DB.

## Project Structure

See [CLAUDE.md](CLAUDE.md) for detailed conventions and file structure.

## Environment Variables

See [.env.example](.env.example) for all configurable variables.

## License

Private project.
