const { pool, query } = require("../utils/db");

exports.createBug = async (data) => {
  const result = await query(
    "INSERT INTO bugs (title, description, severity, status, reporter_id) VALUES ($1, $2, $3, 'OPEN', $4) RETURNING *",
    [data.title, data.description, data.severity, data.reporterId]
  );
  return result.rows[0];
};

exports.getBugById = async (id) => {
  const result = await query(
    "SELECT b.*, u.email AS assignee_email FROM bugs b LEFT JOIN users u ON b.assignee_id = u.id WHERE b.id = $1",
    [id]
  );
  return result.rows[0];
};

exports.listBugs = async (filters = {}) => {
  const conditions = [];
  const params = [];
  let idx = 1;
  if (filters.status) {
    conditions.push(`b.status = $${idx++}`);
    params.push(filters.status);
  }
  if (filters.assigneeId) {
    conditions.push(`b.assignee_id = $${idx++}`);
    params.push(filters.assigneeId);
  }
  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
  const result = await query(
    `SELECT b.*, u.email AS assignee_email FROM bugs b LEFT JOIN users u ON b.assignee_id = u.id ${where} ORDER BY b.created_at DESC`,
    params
  );
  return result.rows;
};

exports.updateBug = async (id, updates) => {
  const allowed = ["title", "description", "severity", "status"];
  const setClauses = [];
  const params = [];
  let idx = 1;
  for (const [key, value] of Object.entries(updates)) {
    if (allowed.includes(key) && value !== undefined) {
      setClauses.push(`${key} = $${idx++}`);
      params.push(value);
    }
  }
  if (setClauses.length === 0) return exports.getBugById(id);
  setClauses.push("updated_at = NOW()");
  params.push(id);
  const result = await query(
    `UPDATE bugs SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    params
  );
  return result.rows[0];
};

exports.assignBug = async (bugId, assigneeId, assignedBy) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO bug_assignments (bug_id, assignee_id, assigned_by) VALUES ($1, $2, $3)",
      [bugId, assigneeId, assignedBy]
    );
    await client.query(
      "UPDATE bugs SET assignee_id = $1, status = 'IN_PROGRESS', updated_at = NOW() WHERE id = $2",
      [assigneeId, bugId]
    );
    await client.query(
      "UPDATE developer_metrics SET open_bug_count = open_bug_count + 1, updated_at = NOW() WHERE user_id = $1",
      [assigneeId]
    );
    await client.query("COMMIT");
    const r = await client.query(
      "SELECT * FROM bug_assignments WHERE bug_id = $1 ORDER BY assigned_at DESC LIMIT 1",
      [bugId]
    );
    return r.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.listAssignments = async () => {
  const result = await query(
    `SELECT ba.*, b.title, b.severity, assignee.email AS assignee_email, assigner.email AS assigned_by_email
     FROM bug_assignments ba
     JOIN bugs b ON ba.bug_id = b.id
     JOIN users assignee ON ba.assignee_id = assignee.id
     JOIN users assigner ON ba.assigned_by = assigner.id
     ORDER BY ba.assigned_at DESC`
  );
  return result.rows;
};
