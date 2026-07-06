# Task Tracker

A full-stack task management application with authentication, role-based access control (RBAC), and real-time updates. Users can create and manage their own tasks; administrators can view and manage all tasks across the system. Task changes propagate to connected clients in real time via WebSockets.

## Tech Stack

**Backend**
- Node.js + Express — REST API
- PostgreSQL — relational data store
- Prisma — ORM and migrations
- JSON Web Tokens (JWT) — stateless authentication
- bcryptjs — password hashing
- Zod — request validation
- Socket.IO — real-time task updates
- Jest + Supertest — integration testing

**Frontend**
- React + TypeScript
- Vite — build tooling and dev server
- React Router — client-side routing
- Axios — HTTP client
- Socket.IO client — real-time updates
- Tailwind CSS — styling

**Tooling**
- GitHub Actions — CI (install, lint, test)
- ESLint — linting

## Project Structure

```
task-tracker-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Data model (User, Task, enums)
│   │   └── seed.js              # Seeds the admin user
│   ├── src/
│   │   ├── config/             # env validation, Prisma client, Socket.IO setup
│   │   ├── middleware/         # authenticate, authorize (RBAC), validate, errorHandler
│   │   ├── modules/
│   │   │   ├── auth/           # schema, service, controller, routes
│   │   │   └── tasks/          # schema, service, controller, routes, events
│   │   ├── utils/              # ApiError, asyncHandler, jwt helpers
│   │   ├── app.js              # Express app (exported for tests)
│   │   ├── routes.js           # Route aggregation
│   │   └── server.js           # HTTP + Socket.IO bootstrap
│   └── tests/                  # Integration tests
├── frontend/
│   └── src/
│       ├── api/                # Axios instance + endpoint calls
│       ├── auth/               # Auth context + protected route
│       ├── components/         # Reusable UI (TaskCard, TaskForm, filters, badge)
│       ├── hooks/              # useSocket (real-time)
│       ├── pages/              # Login, Register, Dashboard
│       └── types.ts            # Shared TypeScript types
└── .github/workflows/ci.yml    # CI pipeline
```

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ running locally (or reachable via a connection string)

## Setup Instructions

### 1. Clone and install

```bash
git clone <your-repo-url>
cd task-tracker-app
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create the environment file by copying the example:

```bash
cp .env.example .env
```

Edit `.env` and set your values (see Environment Configuration below). At minimum, set `DATABASE_URL` to point at your PostgreSQL instance and provide a `JWT_SECRET`.

Create the database (if it does not already exist), then run the migration to create the tables:

```bash
npm run prisma:migrate
```

Seed the admin user:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:4000`. A health check is available at `http://localhost:4000/api/health`.

### 3. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

## Environment Configuration

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the API listens on | `4000` |
| `NODE_ENV` | Environment name | `development` |
| `CLIENT_ORIGIN` | Frontend origin (for CORS + Socket.IO) | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/task_tracker?schema=public` |
| `JWT_SECRET` | Secret used to sign JWTs | (a long random string) |
| `JWT_EXPIRES_IN` | Token lifetime | `1d` |
| `ADMIN_EMAIL` | Seeded admin account email | `admin@example.com` |
| `ADMIN_PASSWORD` | Seeded admin account password | `Admin@12345` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL of the REST API | `http://localhost:4000/api` |
| `VITE_SOCKET_URL` | Base URL of the Socket.IO server | `http://localhost:4000` |

## Default Credentials

After running `npm run seed`, an admin account is created using the credentials from your `.env`:

- **Email:** `admin@example.com` (or your `ADMIN_EMAIL`)
- **Password:** `Admin@12345` (or your `ADMIN_PASSWORD`)

Regular users can be created through the registration screen. All registrations create a `USER` role account; the admin role can only be assigned via the seed script.

## Running Tests

```bash
cd backend
npm test
```

Tests run against a separate database (`task_tracker_test`). Ensure that database exists and that `backend/.env.test` is configured. See the Testing section below.

## API Overview

All endpoints are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

**Auth**
- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — log in, receive a JWT
- `GET /api/auth/me` — get the current user (protected)

**Tasks** (all protected)
- `POST /api/tasks` — create a task
- `GET /api/tasks` — list tasks (supports `page`, `limit`, `status`, `ownerId`)
- `GET /api/tasks/:id` — get a task by ID
- `PATCH /api/tasks/:id` — update a task
- `DELETE /api/tasks/:id` — delete a task

A Postman collection is included in the `postman/` directory covering all endpoints.

## Design Decisions

### Architecture

The backend follows a **layered, modular architecture**. Each feature (auth, tasks) is a self-contained module split into four layers:

- **Schema** (Zod) — defines and validates the shape of incoming requests.
- **Service** — pure business logic with no knowledge of HTTP. This is where data access and authorization rules live.
- **Controller** — a thin HTTP layer that reads the request, calls the service, and formats the response.
- **Routes** — wires URLs to controllers and applies middleware.

This separation keeps business logic testable in isolation and makes the codebase easy to navigate and extend.

### Authorization enforced at the data layer

Rather than relying solely on route-level guards, ownership rules are enforced inside the task service. When a non-admin lists tasks, the query is *forced* to filter by their own user ID — even if they attempt to pass a different `ownerId`, it is overwritten. Admins may optionally filter by owner. Single-task reads, updates, and deletes reuse the same permission check. This ensures a user can never access another user's data, regardless of how the request is crafted.

### Consistent error handling

A custom `ApiError` class carries an HTTP status code, and a single central error-handling middleware converts all errors — including Prisma-specific errors like unique-constraint violations — into a consistent JSON response shape (`{ success, message, details? }`). Async controllers are wrapped in an `asyncHandler` so thrown errors flow to this handler without repetitive try/catch blocks.

### Authentication

Authentication is stateless via JWT. On login/registration, the server returns a signed token containing the user ID and role. The token is verified on each protected request, and the user is re-fetched from the database to confirm they still exist and to use their current role. The same token authenticates Socket.IO connections.

### Real-time updates

Socket.IO shares the HTTP server. On connection, each socket is authenticated with the same JWT and joined to rooms based on identity: a private `user:<id>` room, plus an `admins` room for admin users. When a task is created, updated, or deleted, the event is emitted to the owner's room and the admins room. This mirrors the REST authorization model — clients only receive real-time events for tasks they are permitted to see.

### Status as an enum

Task status is a database-level enum (`TODO`, `IN_PROGRESS`, `DONE`). Enforcing valid values at the schema level prevents invalid data and makes filtering straightforward.

### Frontend token storage

The JWT is stored in `localStorage` for simplicity. This is a reasonable choice for a project of this scope but is readable by JavaScript and therefore vulnerable to XSS-based token theft. For production, an `httpOnly` cookie would be preferable (see Future Improvements).

## Testing

Automated integration tests (Jest + Supertest) cover the core application functionality:

- Registration, including security guarantees (password is never returned; new users always receive the `USER` role)
- Duplicate-email and invalid-input rejection
- Login success and failure
- The authentication guard on protected routes
- Task CRUD operations
- Pagination metadata and status filtering
- **RBAC boundaries**: a user receives `403` when accessing another user's task; an admin can view all users' tasks

Tests run against a dedicated `task_tracker_test` database and reset state between test files for isolation.

## CI Pipeline

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request. It spins up a PostgreSQL service container, installs dependencies, runs the linter, and runs the test suite.

## Assumptions

- A user is identified by a unique email address.
- The admin role is not self-assignable through the API; it is provisioned only via the seed script. This is a deliberate security choice.
- `description` and `dueDate` are optional on a task; only `title`, `status`, and `owner` are required.
- Task status is limited to three states (`TODO`, `IN_PROGRESS`, `DONE`), which covers the standard task lifecycle.
- Pagination defaults to 10 items per page, capped at 100 per request.
- The application is intended to run locally for evaluation; production concerns (HTTPS, secret management, rate limiting) are noted as future work.

## Future Improvements

Given additional time, the following would strengthen the application:

- **Token storage:** move from `localStorage` to `httpOnly` cookies with refresh tokens to mitigate XSS risk.
- **Refresh tokens:** implement short-lived access tokens with a refresh flow rather than a single long-lived token.
- **Admin task management UI:** richer admin controls (reassigning ownership, bulk actions).
- **Frontend tests:** add component and integration tests (e.g. React Testing Library) to complement the backend suite.
- **Pagination UX:** server-side sorting options and configurable page size in the UI.
- **Rate limiting and security headers:** add `express-rate-limit` and `helmet`.
- **Containerization:** a Docker Compose setup for one-command local startup (database + backend + frontend).
- **Deployment:** host the API and frontend, with a managed PostgreSQL instance and continuous deployment.
- **Optimistic UI updates:** update the UI immediately on user actions before the server confirms, for a snappier feel.
