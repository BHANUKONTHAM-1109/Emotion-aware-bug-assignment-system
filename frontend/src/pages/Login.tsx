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
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as any).response &&
        typeof ((err as any).response as { data?: { message?: string } }).data === "object"
          ? ((err as any).response as { data: { message?: string } }).data?.message
          : "Login failed";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-shell">
        {/* Left panel: minimal “website” describing the product */}
        <section className="auth-panel" aria-label="Product overview">
          <div className="auth-panel-header">
            <div className="auth-logo-mark">EA</div>
            <div>
              <div className="auth-logo-title">Emotion-Aware Assignment</div>
              <div className="auth-logo-subtitle">Workload &amp; stress aware bug routing</div>
            </div>
          </div>

          <p className="auth-panel-tagline">
            Route bugs to the right developer by balancing{" "}
            <span className="auth-highlight">severity</span>,{" "}
            <span className="auth-highlight">workload</span> and an approximate{" "}
            <span className="auth-highlight">stress signal</span> – in one click.
          </p>

          <div className="auth-metric-grid" aria-label="Model and system snapshot">
            <div className="auth-metric-card">
              <div className="auth-metric-label">Model band</div>
              <div className="auth-metric-value">Calm → At risk</div>
              <p className="auth-metric-desc">
                A RandomForest model translates workload-style features into an easy band you can reason about.
              </p>
            </div>
            <div className="auth-metric-card">
              <div className="auth-metric-label">Signals</div>
              <div className="auth-metric-value">Workload mix</div>
              <p className="auth-metric-desc">
                Uses open bugs, severity and resolution time, inspired by trends from the OSMI tech survey.
              </p>
            </div>
            <div className="auth-metric-card">
              <div className="auth-metric-label">Engine</div>
              <div className="auth-metric-value">Auto‑assign</div>
              <p className="auth-metric-desc">
                One click proposes an assignee and explains why – managers still stay in control.
              </p>
            </div>
          </div>

          <p className="auth-panel-note">
            This system is a{" "}
            <span className="auth-highlight-soft">decision‑support tool</span>, not a medical product. It helps reduce
            overload and make assignments fairer.
          </p>
        </section>

        {/* Right side: actual login form */}
        <div className="auth-card">
          <div className="auth-header">
            <div className="badge">
              <span className="badge-dot" /> Emotion-aware bug routing
            </div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">
              Log in to see workload‑aware bug assignments and stress analytics for your team.
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
    </div>
  );
}
