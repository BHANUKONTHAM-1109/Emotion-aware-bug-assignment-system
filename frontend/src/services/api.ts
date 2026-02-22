import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ea_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "DEVELOPER";
}

export interface Bug {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  assignee_id?: number;
  assignee_email?: string;
}

export const AuthApi = {
  async login(email: string, password: string) {
    const res = await api.post("/api/auth/login", { email, password });
    return res.data as { user: User; token: string };
  },
  async register(name: string, email: string, password: string, role: string) {
    const res = await api.post("/api/auth/register", { name, email, password, role });
    return res.data as { user: User; token: string };
  },
  async me() {
    const res = await api.get("/api/auth/me");
    return res.data as { user: User };
  },
};

export const BugsApi = {
  async list(params?: { status?: string; mine?: boolean }) {
    const res = await api.get("/api/bugs", { params: { status: params?.status, mine: params?.mine } });
    return res.data as { bugs: Bug[] };
  },
  async get(id: number) {
    const res = await api.get(`/api/bugs/${id}`);
    return res.data as { bug: Bug };
  },
  async create(payload: { title: string; description: string; severity: string }) {
    const res = await api.post("/api/bugs", payload);
    return res.data as { bug: Bug };
  },
  async update(id: number, payload: Partial<Pick<Bug, "title" | "description" | "severity" | "status">>) {
    const res = await api.put(`/api/bugs/${id}`, payload);
    return res.data as { bug: Bug };
  },
  async autoAssign(bugId: number) {
    const res = await api.post(`/api/assignments/auto/${bugId}`);
    return res.data;
  },
};

export const AnalyticsApi = {
  async stressMe() {
    const res = await api.get("/api/stress/me");
    return res.data as { userId: number; predicted_stress_score: number; model_version: string };
  },
  async assignments() {
    const res = await api.get("/api/assignments");
    return res.data as { assignments: AssignmentRow[] };
  },
};

export const DevelopersApi = {
  async list() {
    const res = await api.get("/api/developers");
    return res.data as { developers: DeveloperRow[] };
  },
};

export interface DeveloperRow {
  id: number;
  name: string;
  email: string;
  role: string;
  open_bug_count: number;
  avg_resolution_time_hours: number;
  current_stress_score: number;
}

export interface AssignmentRow {
  id: number;
  bug_id: number;
  assignee_email: string;
  assigned_by_email: string;
  assigned_at: string;
  title: string;
  severity: string;
}

export default api;
