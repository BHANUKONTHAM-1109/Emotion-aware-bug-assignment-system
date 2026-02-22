import { useEffect, useState } from "react";
import { AnalyticsApi, type AssignmentRow } from "../services/api";

export default function Analytics() {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AnalyticsApi.assignments()
      .then((res) => setAssignments(res.assignments ?? []))
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  }, []);

  const criticalCount = assignments.filter((a) => a.severity === "CRITICAL").length;

  return (
    <div>
      <h1 className="page-title">Analytics</h1>
      <div className="grid grid-3">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Total assignments</span>
          </div>
          <div className="stat-value">{assignments.length}</div>
          <p className="label-muted">All-time auto-assignments</p>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Critical bugs routed</span>
          </div>
          <div className="stat-value">{criticalCount}</div>
          <p className="label-muted">High-severity bugs assigned by engine</p>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Model</span>
          </div>
          <p className="label-muted">
            Stress model is trained on workload/survey-style features. See{" "}
            <a href="https://www.kaggle.com/datasets/osmi/mental-health-in-tech-survey" target="_blank" rel="noreferrer">
              OSMI Mental Health in Tech survey
            </a>{" "}
            for context.
          </p>
        </div>
      </div>
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <span className="card-title">Assignment timeline</span>
        </div>
        {loading ? (
          <p className="label-muted">Loading…</p>
        ) : assignments.length === 0 ? (
          <p className="label-muted">No assignments yet. Use Auto-assign on Bugs to see history here.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Bug</th>
                  <th>Severity</th>
                  <th>Assignee</th>
                  <th>Assigned by</th>
                  <th>At</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.severity}</td>
                    <td>{a.assignee_email}</td>
                    <td>{a.assigned_by_email}</td>
                    <td>{new Date(a.assigned_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
