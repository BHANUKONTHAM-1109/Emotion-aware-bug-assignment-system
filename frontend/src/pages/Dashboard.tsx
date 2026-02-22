import { useEffect, useState } from "react";
import { AnalyticsApi, BugsApi, type Bug, type User } from "../services/api";

interface DashboardProps {
  user: User | null;
}

export default function Dashboard({ user }: DashboardProps) {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [stressScore, setStressScore] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([BugsApi.list({ mine: true }), AnalyticsApi.stressMe()])
      .then(([bugsRes, stress]) => {
        setBugs(bugsRes.bugs.slice(0, 5));
        setStressScore(stress.predicted_stress_score);
      })
      .catch(() => {});
  }, []);

  const stressLabel =
    stressScore == null
      ? "—"
      : stressScore < 0.3
        ? "Calm"
        : stressScore < 0.6
          ? "Focused"
          : "At risk";
  const stressColor =
    stressScore == null ? "#9ca3af" : stressScore < 0.3 ? "#22c55e" : stressScore < 0.6 ? "#eab308" : "#ef4444";

  return (
    <div>
      <h1 className="page-title">Welcome, {user?.name ?? "Developer"}</h1>
      <div className="grid grid-3">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Your stress signal</span>
          </div>
          <div className="card-stress-row">
            <div className="stress-ring" style={{ borderColor: stressColor }}>
              {stressScore == null ? "—" : Math.round(stressScore * 100)}
            </div>
            <div>
              <div className="label-muted">Band</div>
              <div className="stress-label">{stressLabel}</div>
              <div className="label-muted small">
                Based on workload and resolution times. Not medical data.
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Your active bugs</span>
          </div>
          {bugs.length === 0 ? (
            <p className="label-muted">No assigned bugs.</p>
          ) : (
            <ul className="bug-list">
              {bugs.map((bug) => (
                <li key={bug.id} className="bug-list-item">
                  <span>{bug.title}</span>
                  <span className={`chip chip-${bug.severity.toLowerCase()}`}>{bug.severity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Assignment engine</span>
          </div>
          <p className="label-muted">
            Bugs are assigned using workload and stress signals. The ML model uses survey-style
            features aligned with the{" "}
            <a href="https://www.kaggle.com/datasets/osmi/mental-health-in-tech-survey" target="_blank" rel="noreferrer">
              OSMI Mental Health in Tech survey
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
