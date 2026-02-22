import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthApi, type User } from "../services/api";

interface LoginProps {
  onAuth?: (user: User) => void;
}

export default function Login({ onAuth }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user, token } = await AuthApi.login(email, password);
      localStorage.setItem("ea_token", token);
      onAuth?.(user);
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err && err.response && typeof (err.response as { data?: { message?: string } }).data === "object"
        ? (err.response as { data: { message?: string } }).data?.message
        : "Login failed";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="badge">
            <span className="badge-dot" /> Emotion-aware bug routing
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            Log in to see workload-aware bug assignments and stress analytics.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="input-label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="button button-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="auth-footer-text">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
