import { useEffect, useState } from "react";
import { DevelopersApi, type DeveloperRow } from "../services/api";

export default function Developers() {
  const [developers, setDevelopers] = useState<DeveloperRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DevelopersApi.list()
      .then((res) => setDevelopers(res.developers))
      .catch(() => setDevelopers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="page-title">Developers</h1>
      <div className="card">
        {loading ? (
          <p className="label-muted">Loading…</p>
        ) : developers.length === 0 ? (
          <p className="label-muted">No developers in the system yet. Register users with role Developer.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Open bugs</th>
                  <th>Avg resolution (h)</th>
                  <th>Stress score</th>
                </tr>
              </thead>
              <tbody>
                {developers.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.role}</td>
                    <td>{d.open_bug_count}</td>
                    <td>{d.avg_resolution_time_hours.toFixed(1)}</td>
                    <td>{Math.round(d.current_stress_score * 100)}</td>
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
