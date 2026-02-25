## Backend (Node.js + Express API)

This directory contains the **REST API** for the Emotion-Aware Workload Optimized Bug Assignment System.
It exposes endpoints for authentication, bug management, stress prediction, developer metrics, and auto-assignment.

### Tech stack

- Node.js, Express (CommonJS)
- PostgreSQL (`pg`), connection pooling via `Pool`
- JWT authentication (`jsonwebtoken`), bcrypt password hashing
- Axios for calling the Python/FastAPI ML service
- Helmet, CORS, morgan, centralized error handling

### High-level architecture

- `app.js` – Express app, middlewares, route mounting, `/health` endpoint.
- `server.js` – entry point (`npm start` / `npm run dev`), listens on `PORT`.
- `routes/` – HTTP routes grouped by domain:
  - `authRoutes.js` – `/api/auth/*` (register, login, me)
  - `bugRoutes.js` – `/api/bugs/*` (CRUD for bugs)
  - `stressRoutes.js` – `/api/stress/*` (me / :userId)
  - `assignmentRoutes.js` – `/api/assignments/*` (auto-assign + history)
  - `developersRoutes.js` – `/api/developers` (developer metrics)
- `controllers/` – request/response orchestration, calls services/models.
- `services/` – domain logic:
  - `stressService.js` – fetch developer metrics, call ML `/predict`, heuristics fallback.
  - `assignmentService.js` – choose assignee based on workload + stress.
- `models/` – DB access using SQL (e.g. `bugModel.js` for bugs & assignments).
- `middleware/` – `authMiddleware.js` (JWT), `errorHandler.js` (404 + global error handler).
- `utils/` – `db.js` (PostgreSQL pool + query helper), `jwt.js` (signToken).

### Environment variables

Create `backend/.env` (or copy from your own `.env` and sanitize) with:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL / Supabase
DATABASE_URL=postgresql://user:password@host:5432/dbname
# Or use DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# JWT
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d

# ML service
ML_SERVICE_URL=http://localhost:8000/predict

# Optional: frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

> **Note**: When `DATABASE_URL` contains `supabase`, SSL is enabled automatically in `utils/db.js`.

### Running the backend locally

From the repo root:

```bash
cd backend
npm install
npm run dev   # or: npm start
```

- The API will be available at `http://localhost:5000`.
- Health check: `GET /health` → `{ "status": "ok", ... }`.

### Main endpoints (summary)

- `POST /api/auth/register` – register user (name, email, password, role).
- `POST /api/auth/login` – login, returns `{ user, token }`.
- `GET /api/auth/me` – current user (requires `Authorization: Bearer <token>`).
- `GET /api/bugs` – list bugs (supports `?status=` and `?mine=true`).
- `POST /api/bugs` – create bug.
- `GET /api/bugs/:id` – get bug by id.
- `PUT /api/bugs/:id` – update bug (title, description, severity, status).
- `GET /api/stress/me` – stress prediction for current user.
- `GET /api/stress/:userId` – stress prediction for given user id.
- `POST /api/assignments/auto/:bugId` – auto-assign bug using workload+stress scoring.
- `GET /api/assignments` – list assignment history.
- `GET /api/developers` – list developers + metrics (`developer_metrics` joined with `users`).

### Tests

There are simple health-check tests under `backend/tests` using **supertest**:

- `auth.test.js`, `bug.test.js` – verify `/health` responds and the DB pool closes cleanly.

You can extend these with more detailed API tests for auth, bug creation, and auto-assignment.

