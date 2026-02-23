import { useEffect, useMemo, useState } from "react";
import { AnalyticsApi, BugsApi, type Bug, type User } from "../services/api";

interface DashboardProps {
  user: User | null;
}

type BugFilter = "all" | "high";

export default function Dashboard({ user }: DashboardProps) {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [stressScore, setStressScore] = useState<number | null>(null);
  const [bugFilter, setBugFilter] = useState<BugFilter>("all");

  useEffect(() => {
    Promise.all([BugsApi.list({ mine: true }), AnalyticsApi.stressMe()])
      .then(([bugsRes, stress]) => {
        setBugs(bugsRes.bugs.slice(0, 10));
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

  const workloadStats = useMemo(() => {
    const total = bugs.length;
    const critical = bugs.filter((b) => b.severity === "CRITICAL").length;
    const high = bugs.filter((b) => b.severity === "HIGH").length;
    const medium = bugs.filter((b) => b.severity === "MEDIUM").length;
    const low = bugs.filter((b) => b.severity === "LOW").length;
    return { total, critical, high, medium, low };
  }, [bugs]);

  const filteredBugs = useMemo(() => {
    if (bugFilter === "high") {
      return bugs.filter((b) => b.severity === "CRITICAL" || b.severity === "HIGH");
    }
    return bugs;
  }, [bugs, bugFilter]);

  const focusHint =
    stressScore == null
      ? "We will recommend a band once we have enough activity."
      : stressScore < 0.3
        ? "You look calm — this is a good time to tackle deeper work."
        : stressScore < 0.6
          ? "You’re in a focused band — keep an eye on critical work only."
          : "You’re in a high-stress band — consider handing off or re‑prioritising.";

  return (
    <div>
      <h1 className="page-title">Welcome, {user?.name ?? "Developer"}</h1>
      <div className="grid grid-3">
        {/* Stress signal card */}
        <div className="card card-interactive">
          <div className="card-header">
            <span className="card-title">Your stress signal</span>
            <span className="card-subtitle">Approximate band based on recent workload</span>
          </div>
          <div className="card-stress-row">
            <div className="stress-ring" style={{ borderColor: stressColor }}>
              {stressScore == null ? "—" : Math.round(stressScore * 100)}
            </div>
            <div>
              <div className="label-muted">Band</div>
              <div className="stress-label">{stressLabel}</div>
              <div className="label-muted small">{focusHint}</div>
            </div>
          </div>
        </div>

        {/* Workload overview */}
        <div className="card card-interactive">
          <div className="card-header">
            <span className="card-title">Workload overview</span>
            <span className="card-subtitle">Severity mix for your currently assigned bugs</span>
          </div>
          {workloadStats.total === 0 ? (
            <p className="label-muted">No assigned bugs yet.</p>
          ) : (
            <>
              <div className="spark-bar-row" aria-hidden="true">
                {["critical", "high", "medium", "low"].map((key) => {
                  const count = (workloadStats as any)[key] as number;
                  if (!count) return null;
                  const width = (count / workloadStats.total) * 100;
                  return (
                    <div
                      key={key}
                      className={`spark-bar spark-${key}`}
                      style={{ width: `${width}%` }}
                    />
                  );
                })}
              </div>
              <div className="pill-row">
                <span className="pill pill-muted">
                  Total <span className="pill-count">{workloadStats.total}</span>
                </span>
                <span className="pill pill-critical">
                  Critical <span className="pill-count">{workloadStats.critical}</span>
                </span>
                <span className="pill pill-high">
                  High <span className="pill-count">{workloadStats.high}</span>
                </span>
                <span className="pill pill-medium">
                  Medium <span className="pill-count">{workloadStats.medium}</span>
                </span>
                <span className="pill pill-low">
                  Low <span className="pill-count">{workloadStats.low}</span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Recent bugs with quick filter */}
        <div className="card card-interactive">
          <div className="card-header">
            <span className="card-title">Your recent bugs</span>
          </div>
          <div className="pill-row pill-row-compact" aria-label="Bug filters">
            <button
              type="button"
              className={`pill pill-toggle ${bugFilter === "all" ? "pill-toggle-active" : ""}`}
              onClick={() => setBugFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`pill pill-toggle ${bugFilter === "high" ? "pill-toggle-active" : ""}`}
              onClick={() => setBugFilter("high")}
            >
              High & critical
            </button>
          </div>
          {filteredBugs.length === 0 ? (
            <p className="label-muted small">No bugs in this view.</p>
          ) : (
            <ul className="bug-list">
              {filteredBugs.slice(0, 6).map((bug) => (
                <li key={bug.id} className="bug-list-item bug-list-item-compact">
                  <div className="bug-list-main">
                    <span className="bug-title">{bug.title}</span>
                    <span className={`chip chip-${bug.severity.toLowerCase()}`}>{bug.severity}</span>
                  </div>
                  <p className="bug-description">
                    {bug.description?.length > 80
                      ? `${bug.description.slice(0, 80).trim()}…`
                      : bug.description || "No description"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Assignment engine explanation stays minimal but clear */}
      <div style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">How assignments are decided</span>
          </div>
          <p className="label-muted">
            This workspace uses workload (open bugs, resolution time) and an approximate stress model to suggest
            assignees. The model is inspired by signals from the{" "}
            <a
              href="https://www.kaggle.com/datasets/osmi/mental-health-in-tech-survey"
              target="_blank"
              rel="noreferrer"
            >
              OSMI Mental Health in Tech survey
            </a>{" "}
            and is designed as a decision-support tool, not a medical instrument.
          </p>
        </div>
      </div>
    </div>
  );
}
