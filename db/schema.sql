-- Emotion-Aware Bug Assignment System - PostgreSQL / Supabase schema
-- Run this in your Supabase SQL editor or: psql $DATABASE_URL -f db/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (developers, managers, admins)
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'DEVELOPER',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bugs
CREATE TABLE IF NOT EXISTS bugs (
    id              SERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    severity        TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status          TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    reporter_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignee_id     INT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Developer metrics (workload + productivity + stress)
CREATE TABLE IF NOT EXISTS developer_metrics (
    user_id                     INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    open_bug_count              INT NOT NULL DEFAULT 0,
    avg_resolution_time_hours   NUMERIC(10,2) NOT NULL DEFAULT 0,
    current_stress_score        NUMERIC(5,2) NOT NULL DEFAULT 0,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bug assignment history
CREATE TABLE IF NOT EXISTS bug_assignments (
    id              SERIAL PRIMARY KEY,
    bug_id          INT NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
    assignee_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_assignee_id ON bugs(assignee_id);
CREATE INDEX IF NOT EXISTS idx_bug_assignments_bug_id ON bug_assignments(bug_id);
CREATE INDEX IF NOT EXISTS idx_bug_assignments_assignee_id ON bug_assignments(assignee_id);
