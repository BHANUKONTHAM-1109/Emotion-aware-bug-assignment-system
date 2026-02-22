const { query } = require("../utils/db");

exports.getDevelopers = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role,
              dm.open_bug_count, dm.avg_resolution_time_hours, dm.current_stress_score
       FROM users u
       LEFT JOIN developer_metrics dm ON dm.user_id = u.id
       WHERE u.role IN ('DEVELOPER', 'MANAGER', 'ADMIN')
       ORDER BY u.name`
    );
    const developers = result.rows.map((r) => ({
      ...r,
      open_bug_count: Number(r.open_bug_count || 0),
      avg_resolution_time_hours: Number(r.avg_resolution_time_hours || 0),
      current_stress_score: Number(r.current_stress_score || 0),
    }));
    res.json({ developers });
  } catch (err) {
    next(err);
  }
};
