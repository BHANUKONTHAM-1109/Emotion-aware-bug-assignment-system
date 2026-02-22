# Emotion-Aware Workload Optimized Bug Assignment System

Enterprise-grade bug tracking and assignment platform that assigns bugs to developers based on **workload**, **stress signals**, and **productivity** using an ML model aligned with the [OSMI Mental Health in Tech Survey](https://www.kaggle.com/datasets/osmi/mental-health-in-tech-survey) dataset.

## Architecture

- **Frontend**: React + TypeScript (Vite), JWT auth, dark UI
- **Backend**: Node.js + Express (CommonJS), layered routes → controllers → services → models
- **Database**: PostgreSQL (Supabase-compatible)
- **ML**: Python FastAPI microservice; model trained on `ml/train.csv` (workload/stress-style features)
- **Deploy**: Render (backend + ML), Vercel (frontend), Supabase (DB)

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

## Setup

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

## Screenshots

Add screenshots (e.g. `docs/screenshots/dashboard.png`, `bugs.png`, `analytics.png`) for your report or README.

## License

ISC.
