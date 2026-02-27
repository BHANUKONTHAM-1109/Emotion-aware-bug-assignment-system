## Frontend (React + TypeScript SPA)

This directory contains the **single-page web application** for the Emotion-Aware Workload Optimized Bug Assignment System.
It provides authentication, a dashboard, and views for bugs, developers and analytics.

### Tech stack

- React 19, TypeScript
- Vite (bundler/dev server)
- React Router (client-side routing)
- Axios for HTTP requests to the backend API

### App structure

- `index.html` – root HTML, loads `src/main.jsx`.
- `vite.config.js` – Vite configuration (`@vitejs/plugin-react`).
- `src/main.jsx` – bootstraps React, wraps `App` with `BrowserRouter`, imports global CSS.
- `src/App.tsx` – top-level routes and auth bootstrap:
  - `/login` and `/register` – public routes.
  - `/dashboard`, `/bugs`, `/developers`, `/analytics` – protected via `ProtectedRoute`.
- `src/routes/ProtectedRoute.tsx` – redirects to `/login` if no JWT token is present.
- `src/components/Layout.tsx` / `Sidebar.tsx` – application shell and navigation.
- `src/services/api.ts` – Axios instance + typed API helpers (`AuthApi`, `BugsApi`, `AnalyticsApi`, `DevelopersApi`).
- `src/pages/` – main screens:
  - `Login.tsx` – login form + left-hand product overview panel.
  - `Register.tsx` – user registration form (name, email, password, role).
  - `Dashboard.tsx` – stress band, workload overview (severity mix), recent bugs.
  - `Bugs.tsx` – bug list + create form + “Auto-assign” per bug.
  - `Developers.tsx` – developer workload and stress metrics table.
  - `Analytics.tsx` – assignment statistics and history.
- `src/index.css` – global styles (layout, sidebar, cards, forms, dashboard widgets, login hero panel).

### Environment variables

Create or edit `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000
```

Where `VITE_API_URL` points to the backend API base URL (without `/api` suffix).
In production (e.g. Vercel), set this to your deployed backend URL.

### Running the frontend locally

From the repo root:

```bash
cd frontend
npm install
npm run dev
```

- App will be available at `http://localhost:5173` by default.
- Make sure the backend is running and `VITE_API_URL` matches its URL.

### Auth and API behaviour

- On successful login or registration, the backend returns `{ user, token }`.
- The frontend stores the JWT in `localStorage` under the key `ea_token`.
- `src/services/api.ts` adds `Authorization: Bearer <token>` automatically to all requests when the token is present.
- Protected routes use `ProtectedRoute` to redirect unauthenticated users back to `/login`.

