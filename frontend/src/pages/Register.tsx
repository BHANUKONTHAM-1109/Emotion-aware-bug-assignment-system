import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthApi, type User } from "../services/api";

interface RegisterProps {
  onAuth?: (user: User) => void;
}

export default function Register({ onAuth }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("DEVELOPER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user, token } = await AuthApi.register(name, email, password, role);
      localStorage.setItem("ea_token", token);
      onAuth?.(user);
      navigate("/dashboard");
    } catch (err: unknown) {
      let msg = "Registration failed";
      if (err && typeof err === "object" && "response" in err) {
        const res = (err as { response?: { data?: { message?: string }; status?: number } }).response;
        if (res?.data?.message) msg = res.data.message;
        else if (res?.status === 404 || (err as { code?: string }).code === "ERR_NETWORK")
          msg = "Cannot reach server. Is the backend running at " + (import.meta.env.VITE_API_URL || "http://localhost:5000") + "?";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">
            Register as developer, manager, or admin for emotion-aware assignment.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Developer"
              required
            />
          </div>
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
          <div className="form-group">
            <label className="input-label">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="DEVELOPER">Developer</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="button button-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
