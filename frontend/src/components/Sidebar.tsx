import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("ea_token");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">EA</div>
          <div>
            <div className="sidebar-logo-title">Emotion-Aware</div>
            <div className="sidebar-logo-sub">Bug Assignment</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}>
            <span>📊 Dashboard</span>
          </NavLink>
          <NavLink to="/bugs" className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}>
            <span>🐞 Bugs</span>
          </NavLink>
          <NavLink to="/developers" className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}>
            <span>👩‍💻 Developers</span>
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}>
            <span>📈 Analytics</span>
          </NavLink>
        </nav>
      </div>
      <div className="sidebar-footer">
        <button type="button" className="button-secondary" onClick={handleLogout}>
          Log out
        </button>
        <div className="sidebar-version">Stress-aware assignment · v1.0</div>
      </div>
    </aside>
  );
}
