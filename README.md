# Emotion-Aware Workload Optimized Bug Assignment System

An enterprise-grade bug tracking and assignment platform that assigns bugs to developers based on **workload**, **stress signals**, and **productivity**, using an ML model inspired by the [OSMI Mental Health in Tech Survey](https://www.kaggle.com/datasets/osmi/mental-health-in-tech-survey).

The goal is to make bug assignment **fairer and less stressful** by giving managers a decision-support tool that is workload- and emotion-aware (not a medical product).

## Tech stack

- **Frontend**: React, TypeScript, Vite, React Router
- **Backend**: Node.js, Express (CommonJS), JSON Web Tokens (JWT)
- **Database**: PostgreSQL (Supabase-compatible)
- **ML service**: Python, FastAPI, scikit-learn, joblib
- **Tooling / DevOps**: GitHub Actions, Render (backend + ML), Vercel (frontend), Supabase (DB)

## Key features

- **Emotion-aware auto-assignment** – assigns bugs using a composite of severity, open bug count, average resolution time and an approximate stress score from the ML service.
- **Interactive dashboard** – shows the logged-in developer’s stress band, workload mix (severity distribution) and recent assigned bugs, with light visualizations and filters.
- **Product-style login page** – the login view doubles as a minimal landing page explaining the product, model, and ethics in plain language.
- **Full bug lifecycle** – create, list, view and update bugs, with assignment history stored in `bug_assignments` for analytics.
- **Developer metrics** – `developer_metrics` table tracks open bugs, resolution time and current stress score per user.
- **ML microservice** – a separate FastAPI service exposes `/predict` for stress scoring, fed with developer metrics from the backend.
- **Clean architecture** – controllers, services, and models separated in the backend; typed API client and clear routing on the frontend.

## Project structure

```
├── backend/          # Node.js API
│   ├── app.js        # Express app, routes, middleware
│   ├── server.js     # Entry point
│   ├── middleware/   # auth, errorHandler
│   ├── controllers/
│   ├── routes/
│   ├── services/     # stressService, assignmentService
│   ├── models/
│   └── utils/        # db, jwt
├── frontend/         # React + Vite
│   └── src/
│       ├── App.tsx
│       ├── components/  # Layout, Sidebar
│       ├── pages/      # Login, Register, Dashboard, Bugs, Developers, Analytics
│       ├── routes/     # ProtectedRoute
│       └── services/   # api.ts
├── ml/                # Python stress model
│   ├── train.py      # Train on train.csv → stress_model.pkl
│   ├── stress_model.py # FastAPI /predict service
│   └── requirements.txt
├── db/
│   └── schema.sql    # PostgreSQL schema
└── .github/workflows/ci.yml
```

## Setup (local development)

### 1. Database (PostgreSQL / Supabase)

- Create a database (e.g. Supabase project).
- Run the schema:

```bash
psql "<connection-string>" -f db/schema.sql
```

Or paste `db/schema.sql` into the Supabase SQL editor.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL or DB_* , JWT_SECRET, ML_SERVICE_URL, PORT
npm install
npm run dev
```

API runs at `http://localhost:5000`. Use `server.js` as entry (`npm start`).

### 3. ML service

```bash
cd ml
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python train.py          # Produces stress_model.pkl from train.csv
uvicorn stress_model:app --reload --port 8000
```

Backend `ML_SERVICE_URL` should be `http://localhost:8000/predict`.

### 4. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

Open `http://localhost:5173`. Register a user, then create bugs and use **Auto-assign** on the Bugs page.
You will see:

- **Login page**: split layout showing a short product overview on the left and the login form on the right.
- **Dashboard**: stress band, workload overview (severity mix), and recent bugs list.

## Environment files and naming

This project follows a consistent naming convention for environment templates:

- **Backend**: `backend/.env.example` → copy to `backend/.env` and fill in values.
- **Frontend**: `frontend/.env.example` → copy to `frontend/.env`.
- **ML service** (optional): `ml/.env.example` → copy to `ml/.env` if you want to override the default `PORT`.

Standardised names (`.env.example`) make it clear which variables are required and keep repository-safe defaults out of `.env` files.

## API (base: `http://localhost:5000`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Health check |
| POST | /api/auth/register | No | Register (name, email, password, role) |
| POST | /api/auth/login | No | Login (email, password) |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/bugs | Yes | List bugs (?status=, ?mine=true) |
| POST | /api/bugs | Yes | Create bug |
| GET | /api/bugs/:id | Yes | Get bug |
| PUT | /api/bugs/:id | Yes | Update bug |
| GET | /api/stress/me | Yes | My stress prediction |
| GET | /api/stress/:userId | Yes | Stress for user |
| POST | /api/assignments/auto/:bugId | Yes | Auto-assign bug |
| GET | /api/assignments | Yes | List assignments |
| GET | /api/developers | Yes | List developers + metrics |

## Deployment

- **Backend (Render)**: New Web Service, root `backend/`, build `npm install`, start `node server.js`. Set env: `DATABASE_URL`, `JWT_SECRET`, `ML_SERVICE_URL`, `FRONTEND_URL`.
- **ML (Render)**: Root `ml/`, build `pip install -r requirements.txt && python train.py`, start `uvicorn stress_model:app --host 0.0.0.0 --port $PORT`. Set backend `ML_SERVICE_URL` to this service URL + `/predict`.
- **Frontend (Vercel)**: Root `frontend/`, build `npm run build`, output `dist`. Env: `VITE_API_URL=<backend URL>`.

## What you still need to do

1. **Apply DB schema**: Run `db/schema.sql` on your Supabase (or PostgreSQL) database.
2. **Configure .env**: In `backend/` and `frontend/` copy `.env.example` to `.env` and set:
   - Backend: `DATABASE_URL` (or `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), `JWT_SECRET`, `ML_SERVICE_URL` (e.g. `http://localhost:8000/predict`), optional `PORT` and `FRONTEND_URL`.
   - Frontend: `VITE_API_URL=http://localhost:5000` (or your deployed backend URL).
3. **Install and run**:
   - Backend: `npm install` then `npm run dev` (or `node server.js`).
   - ML: `pip install -r requirements.txt`, `python train.py`, then `uvicorn stress_model:app --reload --port 8000`.
   - Frontend: `npm install` then `npm run dev`.
4. **First user**: Open the app, go to Register, create an account (e.g. Developer). Then log in and create a bug, then click **Auto-assign** to test the assignment engine.
5. **Optional**: Add more developers (register with role Developer) so the auto-assign has multiple candidates. Optionally update `developer_metrics` (e.g. resolution times) for more realistic stress scoring.

## How to talk about this project (for your portfolio)

In interviews or your portfolio you can describe this project as:

> A full-stack SaaS-style bug tracking platform that auto-assigns bugs to developers based on workload, productivity and an approximate stress signal from an ML model. It combines a Node.js/Express API and PostgreSQL schema with a Python/FastAPI microservice and a React+TypeScript dashboard to give managers a transparent, emotion-aware decision-support tool for routing work.

## Screenshots

Add screenshots (e.g. `docs/screenshots/dashboard.png`, `bugs.png`, `analytics.png`) for your report or README.

## License

ISC.
