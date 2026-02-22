import { useEffect, useState } from "react";
import { BugsApi, type Bug } from "../services/api";

export default function Bugs() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");
  const [description, setDescription] = useState("");

  const load = () => {
    setLoading(true);
    BugsApi.list()
      .then((res) => setBugs(res.bugs))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await BugsApi.create({ title, severity, description });
      setTitle("");
      setSeverity("MEDIUM");
      setDescription("");
      load();
    } finally {
      setCreating(false);
    }
  };

  const handleAutoAssign = async (bugId: number) => {
    setAssigningId(bugId);
    try {
      await BugsApi.autoAssign(bugId);
      load();
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">Bugs</h1>
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Create bug</span>
          </div>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="input-label">Title</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Crash when saving"
                required
              />
            </div>
            <div className="form-group">
              <label className="input-label">Severity</label>
              <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Description</label>
              <textarea
                className="input textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Steps to reproduce…"
              />
            </div>
            <button type="submit" className="button" disabled={creating}>
              {creating ? "Creating…" : "Create bug"}
            </button>
          </form>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Bug list</span>
          </div>
          {loading ? (
            <p className="label-muted">Loading…</p>
          ) : bugs.length === 0 ? (
            <p className="label-muted">No bugs yet. Create one on the left.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Assignee</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {bugs.map((bug) => (
                    <tr key={bug.id}>
                      <td>{bug.title}</td>
                      <td>
                        <span className={`chip chip-${bug.severity.toLowerCase()}`}>{bug.severity}</span>
                      </td>
                      <td>{bug.status}</td>
                      <td>{bug.assignee_email ?? "—"}</td>
                      <td>
                        <button
                          type="button"
                          className="button-secondary button-sm"
                          onClick={() => handleAutoAssign(bug.id)}
                          disabled={assigningId === bug.id}
                        >
                          {assigningId === bug.id ? "Assigning…" : "Auto-assign"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
